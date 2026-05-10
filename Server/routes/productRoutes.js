const express = require("express");
const router  = express.Router();
const Product = require("../models/productModel");
const jwt     = require("jsonwebtoken");

// ── Auth guard ────────────────────────────────────────────────────────────────
const protectAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Access denied. No token." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Admin privileges required." });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ── GET /api/products  (public) ───────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error fetching products." });
  }
});

// ── POST /api/products  (admin) ───────────────────────────────────────────────
// Now accepts an optional `stock` number (defaults to 0)
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { name, image, description, price, quantity, category, stock } = req.body;

    if (!name || !price || !category || !image)
      return res.status(400).json({ message: "Missing required fields." });

    const product = new Product({
      name, image, description, price, quantity, category,
      stock: stock !== undefined ? Number(stock) : 0,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Server Error during product creation." });
  }
});

// ── PATCH /api/products/:id/stock  (admin) ────────────────────────────────────
// Directly set the numeric stock level for a product
router.patch("/:id/stock", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ message: "Invalid product ID." });

    const { stock } = req.body;
    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0)
      return res.status(400).json({ message: "stock must be a non-negative number." });

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { stock: Number(stock) } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Stock updated.", product: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error updating stock." });
  }
});

// ── DELETE /api/products/:id  (admin) ─────────────────────────────────────────
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ message: "Invalid product ID format." });

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found." });

    res.json({ message: "Product removed successfully.", name: deleted.name });
  } catch (err) {
    res.status(500).json({ message: "Server error during product deletion." });
  }
});

module.exports = router;
