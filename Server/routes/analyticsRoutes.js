const express  = require("express");
const router   = express.Router();
const jwt      = require("jsonwebtoken");
const Order    = require("../models/orderModel");
const User     = require("../models/userModel");
const Product  = require("../models/productModel");

// ── Auth guard ───────────────────────────────────────────────────────────────
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ── Helper: last N days as YYYY-MM-DD labels ─────────────────────────────────
const lastNDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
};

// ── GET /api/analytics/summary ────────────────────────────────────────────────
// Returns: totalRevenue, todayRevenue, totalOrders, pendingOrders,
//          totalUsers, totalProducts, lowStockCount
router.get("/summary", verifyAdmin, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      allOrders,
      todayOrders,
      totalUsers,
      products,
    ] = await Promise.all([
      Order.find({}),
      Order.find({ createdAt: { $gte: todayStart } }),
      User.countDocuments({}),
      Product.find({}, "stock name"),
    ]);

    // Revenue = only paid/delivered orders
    const totalRevenue = allOrders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const todayRevenue = todayOrders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const pendingOrders = allOrders.filter((o) => !o.isDelivered).length;
    const lowStockCount = products.filter((p) => p.stock <= 5).length;

    res.json({
      totalRevenue,
      todayRevenue,
      totalOrders:   allOrders.length,
      pendingOrders,
      totalUsers,
      totalProducts: products.length,
      lowStockCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics summary error" });
  }
});

// ── GET /api/analytics/revenue-trend?days=7 ──────────────────────────────────
// Returns daily revenue for the last N days (paid orders only)
router.get("/revenue-trend", verifyAdmin, async (req, res) => {
  try {
    const days  = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      isPaid:    true,
      createdAt: { $gte: since },
    });

    const labels = lastNDays(days);
    const revenueMap = {};
    labels.forEach((d) => (revenueMap[d] = 0));

    orders.forEach((o) => {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (revenueMap[day] !== undefined) revenueMap[day] += o.totalPrice;
    });

    res.json({ labels, values: labels.map((d) => revenueMap[d]) });
  } catch (err) {
    res.status(500).json({ message: "Revenue trend error" });
  }
});

// ── GET /api/analytics/orders-trend?days=7 ───────────────────────────────────
// Returns total order count per day for the last N days
router.get("/orders-trend", verifyAdmin, async (req, res) => {
  try {
    const days  = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);

    const orders = await Order.find({ createdAt: { $gte: since } });

    const labels   = lastNDays(days);
    const countMap = {};
    labels.forEach((d) => (countMap[d] = 0));

    orders.forEach((o) => {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (countMap[day] !== undefined) countMap[day]++;
    });

    res.json({ labels, values: labels.map((d) => countMap[d]) });
  } catch (err) {
    res.status(500).json({ message: "Orders trend error" });
  }
});

// ── GET /api/analytics/top-products?limit=5 ──────────────────────────────────
// Returns top N products by quantity sold (from paid orders)
router.get("/top-products", verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const paidOrders = await Order.find({ isPaid: true });

    const salesMap = {}; // productId → { name, qty, revenue }
    paidOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const id = String(item.product);
        if (!salesMap[id]) salesMap[id] = { name: item.name, qty: 0, revenue: 0 };
        salesMap[id].qty     += item.qty;
        salesMap[id].revenue += item.qty * item.price;
      });
    });

    const sorted = Object.values(salesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, limit);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: "Top products error" });
  }
});

// ── GET /api/analytics/user-signups?days=7 ───────────────────────────────────
// Returns new user registrations per day
router.get("/user-signups", verifyAdmin, async (req, res) => {
  try {
    const days  = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);

    const users = await User.find({ createdAt: { $gte: since } });

    const labels    = lastNDays(days);
    const signupMap = {};
    labels.forEach((d) => (signupMap[d] = 0));

    users.forEach((u) => {
      const day = u.createdAt.toISOString().slice(0, 10);
      if (signupMap[day] !== undefined) signupMap[day]++;
    });

    res.json({ labels, values: labels.map((d) => signupMap[d]) });
  } catch (err) {
    res.status(500).json({ message: "User signups error" });
  }
});

// ── GET /api/analytics/new-orders-since?since=ISO_STRING ─────────────────────
// Polling endpoint for admin notification badge — returns count + list of
// orders placed after the given timestamp
router.get("/new-orders-since", verifyAdmin, async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 60_000);
    const newOrders = await Order.find({ createdAt: { $gt: since } })
      .select("_id totalPrice createdAt")
      .sort({ createdAt: -1 });

    res.json({ count: newOrders.length, orders: newOrders });
  } catch (err) {
    res.status(500).json({ message: "Polling error" });
  }
});

module.exports = router;
