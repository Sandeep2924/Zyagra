const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Order = require("../models/orderModel");

// --- Middleware to Protect User Routes ---
// This checks for a valid user token and attaches user info to the request
const protectUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attaches decoded user info (like id)
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Logged-in users only)
router.post("/", protectUser, async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  } else {
    const order = new Order({
      orderItems,
      user: req.user.id, // Get the user ID from the token via middleware
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @route   GET /api/orders/myorders
// @desc    Get logged-in user's orders
// @access  Private
router.get("/myorders", protectUser, async (req, res) => {
  // Find all orders where the 'user' field matches the logged-in user's ID
  const orders = await Order.find({ user: req.user.id });
  res.json(orders);
});

module.exports = router;
