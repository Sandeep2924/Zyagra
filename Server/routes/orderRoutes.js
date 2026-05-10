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
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ── POST /api/orders  — Create order & decrement stock ────────────────────────
router.post("/", protectUser, async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice, phone } = req.body;

  if (!orderItems || orderItems.length === 0)
    return res.status(400).json({ message: "No order items" });

  try {
    // Decrement stock for each product ordered
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.qty } }
      );
    }

    const order = new Order({
      user:            new ObjectId(req.user.id),
      orderItems,
      shippingAddress,
      phone,
      paymentMethod,
      totalPrice,
    });

    const created = await order.save();
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// ── GET /api/orders/myorders  — Customer's own orders ────────────────────────
router.get("/myorders", protectUser, async (req, res) => {
  const orders = await Order.find({ user: req.user.id });
  res.json(orders);
});

// ── GET /api/orders/allorders  — Admin: all orders ───────────────────────────
router.get("/allorders", protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    // Attach customer fullName to each order (kept compatible with existing frontend)
    for (const order of orders) {
      const user = await User.findById(order.user).select("fullName").lean();
      if (user) {
        order.customerName = user.fullName;
        order.shippingAddress.address =
          user.fullName + " - " + order.shippingAddress.address;
      }
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ── POST /api/orders/updateorder  — Admin: mark delivered ────────────────────
router.post("/updateorder", protectAdmin, async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "Order ID is required" });

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.isPaid)
      return res.status(400).json({ error: "Order already paid and delivered" });
    if (order.status === "cancelled")
      return res.status(400).json({ error: "Cannot deliver a cancelled order" });

    const now = new Date();
    const updated = await Order.findByIdAndUpdate(
      orderId,
      { $set: { isPaid: true, isDelivered: true, paidAt: now, deliveredAt: now, status: "delivered" } },
      { new: true }
    );

    res.json({ message: "Order updated ✅", order: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/orders/cancelorder  — Admin: cancel/reject an order ─────────────
// Cancelling restores the stock so inventory stays accurate
router.post("/cancelorder", protectAdmin, async (req, res) => {
  const { orderId, reason } = req.body;
  if (!orderId) return res.status(400).json({ error: "Order ID is required" });

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.isPaid)
      return res.status(400).json({ error: "Cannot cancel an already-delivered order" });
    if (order.status === "cancelled")
      return res.status(400).json({ error: "Order is already cancelled" });

    // Restore stock for each cancelled item
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.qty } }
      );
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status: "cancelled", cancelReason: reason || "Rejected by admin" } },
      { new: true }
    );

    res.json({ message: "Order cancelled and stock restored ✅", order: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
