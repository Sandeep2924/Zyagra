const express  = require("express");
const router   = express.Router();
const Razorpay = require("razorpay");
const crypto   = require("crypto");
const jwt      = require("jsonwebtoken");

// ── Auth guard ────────────────────────────────────────────────────────────────
const protectUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

// ── Razorpay instance ─────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── POST /api/payment/create-order ────────────────────────────────────────────
// Creates a Razorpay order and returns the order id + amount to the client
router.post("/create-order", protectUser, async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR (e.g. 450.00)

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const options = {
      amount:   Math.round(Number(amount) * 100), // Razorpay uses paise
      currency: "INR",
      receipt:  `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order); // { id, amount, currency, … }
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ message: "Could not create payment order" });
  }
});

// ── POST /api/payment/verify ──────────────────────────────────────────────────
// Verifies the Razorpay signature after a successful payment
// This is the critical security step — never skip it
router.post("/verify", protectUser, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return res.status(400).json({ message: "Missing payment verification fields" });

  // Generate expected signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    console.warn("⚠️ Signature mismatch — possible tampered payment");
    return res.status(400).json({ success: false, message: "Payment verification failed" });
  }

  res.json({ success: true, message: "Payment verified ✅" });
});

module.exports = router;
