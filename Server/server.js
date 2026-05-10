const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const app = express();

app.use(cors());
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/users",     require("./routes/userRoutes"));
app.use("/api/products",  require("./routes/productRoutes"));
app.use("/api/admins",    require("./routes/adminRoutes"));
app.use("/api/orders",    require("./routes/orderRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes")); // ← NEW
app.use("/api/payment", require("./routes/paymentRoutes"));
// ── Root ──────────────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.status(200).json({ success: true, message: "🚀 Zyagra Backend Running" })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route Not Found: ${req.originalUrl}` })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

// ── DB + Server ───────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
    });
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

startServer();
