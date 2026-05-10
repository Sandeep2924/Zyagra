import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../style/CheckoutPage.css";

import { API } from "../config/api";

// ── Razorpay loader ───────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Step indicator ────────────────────────────────────────────────────────────
const StepBar = ({ step }) => {
  const steps = ["Cart", "Shipping", "Payment", "Confirm"];
  return (
    <div className="step-bar">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`step-item ${i + 1 <= step ? "active" : ""} ${i + 1 < step ? "done" : ""}`}>
            <div className="step-circle">{i + 1 < step ? "✓" : i + 1}</div>
            <span className="step-label">{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line ${i + 1 < step ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep]       = useState(2); // 1=cart(done), 2=shipping, 3=payment, 4=confirm
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [autoFilled, setAutoFilled]     = useState(false);
  const [payMethod, setPayMethod]       = useState("razorpay"); // "razorpay" | "cod"

  const [shippingInfo, setShippingInfo] = useState({
    fullName:   "",
    address:    "",
    city:       "",
    phone:      "",
    postalCode: "",
  });

  // ── Auto-fill from account ────────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo?.token) return;
        const res  = await fetch(`${API}/api/users/userdetails/?id=${userInfo.id}`);
        const data = await res.json();
        if (res.ok && data.fullName) {
          setShippingInfo({
            fullName:   data.fullName   || "",
            phone:      data.phone      || "",
            address:    data.shippingAddress?.address    || "",
            city:       data.shippingAddress?.city       || "",
            postalCode: data.shippingAddress?.postalCode || "",
          });
          setAutoFilled(true);
        }
      } catch { /* silently ignore */ }
    };
    fetchUser();
  }, []);

  const handleChange = (e) =>
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });

  const totalPrice = parseFloat(getCartTotal());

  // ── Place order helper (creates DB record after payment) ──────────────────
  const createOrder = async (paymentMethod, razorpayPaymentId = null) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const orderData = {
      orderItems: cartItems.map((item) => ({
        name:    item.name,
        qty:     item.quantity,
        image:   item.image,
        price:   item.price,
        product: item.id,
      })),
      shippingAddress: {
        address:    shippingInfo.address,
        city:       shippingInfo.city,
        postalCode: shippingInfo.postalCode,
      },
      phone:         shippingInfo.phone,
      paymentMethod,
      totalPrice,
      ...(razorpayPaymentId && { razorpayPaymentId }),
    };

    const res  = await fetch(`${API}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${userInfo.token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to place order");
    return data;
  };

  // ── COD submit ────────────────────────────────────────────────────────────
  const handleCOD = async () => {
    setLoading(true);
    setError("");
    try {
      const order = await createOrder("Cash on Delivery");
      clearCart();
      setOrderSuccess({ orderId: order._id, method: "COD" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Razorpay submit ───────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    setLoading(true);
    setError("");
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) throw new Error("Please log in first.");

      // 1. Ask backend to create a Razorpay order
      const res  = await fetch(`${API}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ amount: totalPrice }),
      });
      const rpOrder = await res.json();
      if (!res.ok) throw new Error(rpOrder.message || "Could not initiate payment");

      // 2. Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay SDK failed to load. Check your internet connection.");

      // 3. Open Razorpay checkout
      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      rpOrder.amount,       // in paise
        currency:    rpOrder.currency,
        name:        "Zyagra",
        description: "Fresh Produce Order",
        image:       "/logo.png",
        order_id:    rpOrder.id,
        prefill: {
          name:    shippingInfo.fullName,
          contact: shippingInfo.phone,
        },
        theme: { color: "#2C7A7B" },
        handler: async (response) => {
          // 4. Payment success — verify on backend then create order
          try {
            const verRes  = await fetch(`${API}/api/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization:  `Bearer ${userInfo.token}`,
              },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const verData = await verRes.json();
            if (!verRes.ok || !verData.success)
              throw new Error("Payment verification failed. Contact support.");

            const order = await createOrder("Razorpay", response.razorpay_payment_id);
            clearCart();
            setOrderSuccess({ orderId: order._id, method: "Online (Razorpay)" });
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      // loading stays true until handler/ondismiss fires
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ── Shipping form next ────────────────────────────────────────────────────
  const handleShippingNext = (e) => {
    e.preventDefault();
    const { fullName, address, city, phone, postalCode } = shippingInfo;
    if (!fullName || !address || !city || !phone || !postalCode) {
      setError("Please fill in all shipping fields.");
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!/^[0-9]{6}$/.test(postalCode)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }
    setError("");
    setStep(3);
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="success-modal-overlay">
        <div className="success-modal-content">
          <div className="success-icon">🎉</div>
          <h2>Order Placed!</h2>
          <p>Thank you for shopping with <strong>Zyagra</strong>.</p>
          <div className="order-number">
            <p>Order ID</p>
            <strong>{orderSuccess.orderId}</strong>
          </div>
          <p className="payment-badge">
            {orderSuccess.method === "COD"
              ? "💵 Cash on Delivery"
              : "✅ Paid Online via Razorpay"}
          </p>
          <button onClick={() => navigate("/myorders")} className="checkout-button" style={{ marginTop: "1.5rem" }}>
            📦 Track My Order
          </button>
          <Link to="/" style={{ display: "block", marginTop: "0.8rem", color: "#2C7A7B" }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── EMPTY CART ────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="checkout-container empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some fresh produce before checking out!</p>
        <Link to="/products" className="checkout-button" style={{ display: "inline-block", width: "auto", marginTop: "1rem" }}>
          Shop Now
        </Link>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <StepBar step={step} />

      {error && (
        <div className="error-message-checkout">
          ⚠️ {error}
          <button onClick={() => setError("")} style={{ float: "right", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
        </div>
      )}

      <div className="checkout-layout">

        {/* ── LEFT: steps ───────────────────────────────────────────────── */}
        <div className="customer-details">

          {/* ── STEP 2: SHIPPING ─────────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleShippingNext}>
              <div className="checkout-section">
                <h2>1. Shipping Information</h2>

                {autoFilled && (
                  <div className="autofill-banner">
                    ✨ Details auto-filled from your account — edit if needed
                  </div>
                )}

                <div className="input-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input type="text" id="fullName" name="fullName"
                    value={shippingInfo.fullName} onChange={handleChange} required
                    placeholder="Your full name" />
                </div>

                <div className="input-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone"
                    value={shippingInfo.phone} onChange={handleChange} required
                    maxLength={10} placeholder="10-digit mobile number" />
                </div>

                <div className="input-group">
                  <label htmlFor="address">Street Address</label>
                  <input type="text" id="address" name="address"
                    value={shippingInfo.address} onChange={handleChange} required
                    placeholder="House no., street, area" />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="city">City / Town</label>
                    <input type="text" id="city" name="city"
                      value={shippingInfo.city} onChange={handleChange} required
                      placeholder="e.g. Panipat" />
                  </div>
                  <div className="input-group">
                    <label htmlFor="postalCode">Pincode</label>
                    <input type="text" id="postalCode" name="postalCode"
                      value={shippingInfo.postalCode} onChange={handleChange} required
                      maxLength={6} placeholder="6-digit pincode" />
                  </div>
                </div>
              </div>

              <button type="submit" className="checkout-button">
                Continue to Payment →
              </button>
            </form>
          )}

          {/* ── STEP 3: PAYMENT ──────────────────────────────────────────── */}
          {step === 3 && (
            <div className="checkout-section">
              <h2>2. Payment Method</h2>

              {/* Delivery address preview */}
              <div className="address-review">
                <p>📍 <strong>Delivering to:</strong></p>
                <p>{shippingInfo.fullName} · {shippingInfo.phone}</p>
                <p>{shippingInfo.address}, {shippingInfo.city} — {shippingInfo.postalCode}</p>
                <button onClick={() => { setStep(2); setError(""); }}
                  className="edit-link">Edit address</button>
              </div>

              {/* Payment options */}
              <div className="payment-options">
                <label className={`payment-card ${payMethod === "razorpay" ? "selected" : ""}`}>
                  <input type="radio" name="pay" value="razorpay"
                    checked={payMethod === "razorpay"}
                    onChange={() => setPayMethod("razorpay")} />
                  <div className="payment-card-body">
                    <span className="pay-icon">💳</span>
                    <div>
                      <strong>Pay Online</strong>
                      <p>UPI · Credit/Debit Card · Net Banking · Wallets</p>
                    </div>
                    <span className="pay-badge secure">🔒 Secure</span>
                  </div>
                </label>

                <label className={`payment-card ${payMethod === "cod" ? "selected" : ""}`}>
                  <input type="radio" name="pay" value="cod"
                    checked={payMethod === "cod"}
                    onChange={() => setPayMethod("cod")} />
                  <div className="payment-card-body">
                    <span className="pay-icon">💵</span>
                    <div>
                      <strong>Cash on Delivery</strong>
                      <p>Pay when your order arrives at the door</p>
                    </div>
                    <span className="pay-badge cod">COD</span>
                  </div>
                </label>
              </div>

              <button
                onClick={payMethod === "razorpay" ? handleRazorpay : handleCOD}
                className="checkout-button place-order-button"
                disabled={loading}
              >
                {loading
                  ? "Processing…"
                  : payMethod === "razorpay"
                    ? `Pay ₹${totalPrice.toFixed(2)} →`
                    : "Place Order (COD)"}
              </button>

              <p className="secure-note">🔒 Your details are safe. Powered by Razorpay.</p>
            </div>
          )}

        </div>

        {/* ── RIGHT: order summary ──────────────────────────────────────── */}
        <div className="order-summary">
          <div className="checkout-section">
            <h2>Order Summary</h2>
            <ul className="summary-items">
              {cartItems.map((item) => (
                <li key={item.id} className="summary-item">
                  <div className="summary-item-left">
                    <img src={item.image} alt={item.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }}
                      style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, marginRight: 8 }} />
                    <span className="item-name">{item.name} <em style={{ color: "#888", fontSize: "0.85em" }}>×{item.quantity}</em></span>
                  </div>
                  <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "0.8rem", marginTop: "0.8rem" }}>
              <div className="summary-row"><span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
              <div className="summary-row"><span>Delivery</span><span style={{ color: "#38A169" }}>FREE</span></div>
            </div>

            <div className="summary-total">
              <strong>Total</strong>
              <strong>₹{totalPrice.toFixed(2)}</strong>
            </div>

            {/* Items count pill */}
            <p style={{ textAlign: "center", marginTop: "12px", color: "#888", fontSize: "0.85em" }}>
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in cart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
