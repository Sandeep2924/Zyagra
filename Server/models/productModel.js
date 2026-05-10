const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    image:       { type: String, required: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true },
    quantity:    { type: String, required: true }, // unit label e.g. "500ml", "1 dozen"
    category:    { type: String, required: true },
    // ── NEW: numeric stock units ──────────────────────────────────────────────
    stock:       { type: Number, required: true, default: 0, min: 0 },
    // ─────────────────────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
