const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
require("dotenv").config();

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// ── CORS — allow your Vercel frontend in production, localhost in dev ─────────
const allowedOrigins = [
  "https://zyagra.vercel.app",          // e.g. https://zyagra.vercel.app
  "http://localhost:5173",          // Vite dev server
  "http://localhost:3000",          // CRA fallback
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/users",     require("./routes/userRoutes"));
app.use("/api/products",  require("./routes/productRoutes"));
app.use("/api/admins",    require("./routes/adminRoutes"));
app.use("/api/orders",    require("./routes/orderRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/payment",   require("./routes/paymentRoutes"));

// ── Health check (Render pings this to keep service awake) ───────────────────
app.get("/", (req, res) =>
  res.status(200).json({ success: true, message: "🚀 Zyagra API Running", env: process.env.NODE_ENV || "development" })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route Not Found: ${req.originalUrl}` })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

// ── DB + Server ───────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
    });
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  } catch (err) {
    console.error("❌ MongoDB failed:", err.message);
    process.exit(1);
  }
};

startServer();
