const express  = require("express");
const ObjectId = require("mongodb").ObjectId;
const router   = express.Router();
const jwt      = require("jsonwebtoken");
const Order    = require("../models/orderModel");
const User     = require("../models/userModel");
const Product  = require("../models/productModel");

// ── Auth guards ───────────────────────────────────────────────────────────────
const protectAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Not authorized as an admin" });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const protectUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Valid status order — admin can only advance forward, not skip
const STATUS_PIPELINE = ["placed", "confirmed", "packed", "out_for_delivery", "delivered"];

// ── POST /api/orders — Create order & decrement stock ────────────────────────
router.post("/", protectUser, async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice, phone } = req.body;
  if (!orderItems || orderItems.length === 0)
    return res.status(400).json({ message: "No order items" });
  try {
    for (const item of orderItems)
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });

    const order = new Order({
      user: new ObjectId(req.user.id),
      orderItems, shippingAddress, phone, paymentMethod, totalPrice,
      status: "placed",
    });
    const created = await order.save();
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// ── GET /api/orders/myorders — Customer's own orders ─────────────────────────
router.get("/myorders", protectUser, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

// ── GET /api/orders/allorders — Admin: all orders ─────────────────────────────
router.get("/allorders", protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    for (const order of orders) {
      const user = await User.findById(order.user).select("fullName").lean();
      if (user) order.customerName = user.fullName;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ── POST /api/orders/setstatus — Admin: advance/set order status ──────────────
// Body: { orderId, status }
// Rules:
//   - Can advance to the next step OR jump to "cancelled"
//   - Cannot go backwards
//   - "delivered" auto-sets isPaid + isDelivered + deliveredAt
//   - "cancelled" before "packed" → restores stock
router.post("/setstatus", protectAdmin, async (req, res) => {
  const { orderId, status } = req.body;
  if (!orderId || !status)
    return res.status(400).json({ message: "orderId and status are required" });

  if (!["placed","confirmed","packed","out_for_delivery","delivered","cancelled"].includes(status))
    return res.status(400).json({ message: "Invalid status value" });

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "cancelled")
      return res.status(400).json({ message: "Cannot change a cancelled order" });
    if (order.status === "delivered")
      return res.status(400).json({ message: "Order already delivered" });

    // Prevent going backwards in the pipeline
    if (status !== "cancelled") {
      const currentIdx = STATUS_PIPELINE.indexOf(order.status);
      const newIdx     = STATUS_PIPELINE.indexOf(status);
      if (newIdx <= currentIdx)
        return res.status(400).json({ message: `Cannot move order from '${order.status}' back to '${status}'` });
    }

    const update = { status };

    // Auto-mark delivered fields
    if (status === "delivered") {
      update.isPaid      = true;
      update.isDelivered = true;
      update.paidAt      = new Date();
      update.deliveredAt = new Date();
    }

    // Cancelling before packed → restore stock
    if (status === "cancelled") {
      const prePackedStatuses = ["placed", "confirmed"];
      if (prePackedStatuses.includes(order.status)) {
        for (const item of order.orderItems)
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
      }
    }

    const updated = await Order.findByIdAndUpdate(orderId, { $set: update }, { new: true });
    res.json({ message: `Order status updated to '${status}'`, order: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/orders/setnote — Admin: add/update note (before packed) ─────────
// Body: { orderId, note }
router.post("/setnote", protectAdmin, async (req, res) => {
  const { orderId, note } = req.body;
  if (!orderId) return res.status(400).json({ message: "orderId required" });

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (["packed","out_for_delivery","delivered","cancelled"].includes(order.status))
      return res.status(400).json({ message: "Notes can only be added before order is packed" });

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { $set: { adminNote: (note || "").slice(0, 500) } },
      { new: true }
    );
    res.json({ message: "Note saved", order: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/orders/cancelorder — Admin: cancel (kept for backwards compat) ──
router.post("/cancelorder", protectAdmin, async (req, res) => {
  const { orderId, reason } = req.body;
  if (!orderId) return res.status(400).json({ error: "Order ID required" });
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status === "cancelled") return res.status(400).json({ error: "Already cancelled" });
    if (order.status === "delivered") return res.status(400).json({ error: "Cannot cancel delivered order" });

    const prePackedStatuses = ["placed", "confirmed"];
    if (prePackedStatuses.includes(order.status))
      for (const item of order.orderItems)
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status: "cancelled", cancelReason: reason || "Rejected by admin" } },
      { new: true }
    );
    res.json({ message: "Order cancelled", order: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/orders/updateorder — kept for backwards compat ─────────────────
router.post("/updateorder", protectAdmin, async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "Order ID required" });
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.isPaid) return res.status(400).json({ error: "Already delivered" });
    if (order.status === "cancelled") return res.status(400).json({ error: "Cancelled order" });
    const now = new Date();
    const updated = await Order.findByIdAndUpdate(
      orderId,
      { $set: { isPaid: true, isDelivered: true, paidAt: now, deliveredAt: now, status: "delivered" } },
      { new: true }
    );
    res.json({ message: "Order delivered", order: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
