// in backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const jwt = require("jsonwebtoken"); // We need this to protect routes

// --- Middleware to protect routes ---
const protectAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer TOKEN"
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // We check if the decoded token has an 'admin' role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as an admin" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// --- ROUTES ---

// @route   POST /api/products
// @desc    Add a new product
// @access  Private/Admin
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { name, image, description, price, quantity, category } = req.body;
    const newProduct = new Product({
      name,
      image,
      description,
      price,
      quantity,
      category,
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
