import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../style/MyOrdersPage.css";

import { API } from "../config/api";

// ── Status timeline ───────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { key: "placed",    label: "Order Placed",    icon: "🛒" },
  { key: "confirmed", label: "Confirmed",        icon: "✅" },
  { key: "packed",    label: "Packed",           icon: "📦" },
  { key: "shipped",   label: "Out for Delivery", icon: "🚚" },
  { key: "delivered", label: "Delivered",        icon: "🎉" },
];

const getStepIndex = (order) => {
  if (order.status === "cancelled") return -1;
  if (order.isDelivered)            return 4; // all done
  // Pending orders: show 2 steps done (placed + confirmed)
  return 1;
};

const OrderTimeline = ({ order }) => {
  if (order.status === "cancelled") {
    return (
      <div className="timeline-cancelled">
        ❌ Order Cancelled
        {order.cancelReason && (
          <span style={{ marginLeft: "8px", color: "#718096", fontSize: "0.85em" }}>
            — {order.cancelReason}
          </span>
        )}
      </div>
    );
  }

  const currentStep = getStepIndex(order);
  return (
    <div className="order-timeline">
      {TIMELINE_STEPS.map((step, i) => (
        <div key={step.key}
          className={`tl-step ${i <= currentStep ? "done" : ""} ${i === currentStep ? "current" : ""}`}>
          <div className="tl-icon">{step.icon}</div>
          <div className="tl-label">{step.label}</div>
          {i < TIMELINE_STEPS.length - 1 && (
            <div className={`tl-line ${i < currentStep ? "filled" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ order }) => {
  if (order.status === "cancelled")         return <span className="badge badge-cancelled">Cancelled</span>;
  if (order.isDelivered || order.status === "delivered") return <span className="badge badge-delivered">Delivered</span>;
  return <span className="badge badge-pending">In Progress</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
const MyOrdersPage = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [expanded, setExpanded] = useState(null); // order._id currently open
  const [filter,   setFilter]   = useState("all"); // all | pending | delivered | cancelled

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo?.token) throw new Error("Please log in to view your orders.");

        const res  = await fetch(`${API}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch orders.");
        const data = await res.json();
        // Newest first
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const filteredOrders = orders.filter((o) => {
    if (filter === "all")       return true;
    if (filter === "pending")   return !o.isDelivered && o.status !== "cancelled";
    if (filter === "delivered") return o.isDelivered  || o.status === "delivered";
    if (filter === "cancelled") return o.status === "cancelled";
    return true;
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="my-orders-container">
        <div className="orders-loading">
          <div className="spinner" />
          <p>Loading your orders…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="my-orders-container">
        <div className="orders-error">
          <p>⚠️ {error}</p>
          <Link to="/login" className="shop-now-link">Log In</Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="my-orders-container">
      <h1>My Orders</h1>
      <p className="orders-subtitle">{orders.length} order{orders.length !== 1 ? "s" : ""} placed with Zyagra</p>

      {/* Filter tabs */}
      <div className="order-filters">
        {["all", "pending", "delivered", "cancelled"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`filter-btn ${filter === f ? "active" : ""}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p style={{ fontSize: "2.5rem" }}>🛍️</p>
          <p>No {filter !== "all" ? filter : ""} orders found.</p>
          <Link to="/products" className="shop-now-link">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const isOpen = expanded === order._id;
            const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            });

            return (
              <div key={order._id}
                className={`order-card ${order.status === "cancelled" ? "cancelled" : ""} ${isOpen ? "open" : ""}`}>

                {/* ── Card header (always visible) ─────────────────────── */}
                <div className="order-header" onClick={() => toggle(order._id)}>
                  <div className="order-header-left">
                    <div className="order-id">
                      <span className="label">Order</span>
                      <span className="value">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="order-date">{orderDate}</div>
                  </div>

                  <div className="order-header-right">
                    <StatusBadge order={order} />
                    <div className="order-total">₹{order.totalPrice.toFixed(2)}</div>
                    <span className="expand-icon">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* ── Expanded detail ──────────────────────────────────── */}
                {isOpen && (
                  <div className="order-detail">

                    {/* Timeline */}
                    <OrderTimeline order={order} />

                    {/* Items */}
                    <div className="order-items-section">
                      <h4>Items Ordered</h4>
                      <ul className="order-items-list">
                        {order.orderItems.map((item, i) => (
                          <li key={i} className="order-item-row">
                            <img src={item.image} alt={item.name}
                              onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }}
                              className="order-item-img" />
                            <div className="order-item-info">
                              <strong>{item.name}</strong>
                              <span>Qty: {item.qty} × ₹{item.price.toFixed(2)}</span>
                            </div>
                            <span className="order-item-subtotal">
                              ₹{(item.qty * item.price).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Meta grid */}
                    <div className="order-meta-grid">
                      <div className="meta-block">
                        <p className="meta-label">📍 Shipping Address</p>
                        <p className="meta-value">
                          {order.shippingAddress.address},<br />
                          {order.shippingAddress.city} — {order.shippingAddress.postalCode}
                        </p>
                      </div>
                      <div className="meta-block">
                        <p className="meta-label">📞 Phone</p>
                        <p className="meta-value">{order.phone || "—"}</p>
                      </div>
                      <div className="meta-block">
                        <p className="meta-label">💳 Payment</p>
                        <p className="meta-value">
                          {order.paymentMethod}
                          {order.isPaid
                            ? <span className="paid-tag"> ✅ Paid</span>
                            : <span className="notpaid-tag"> ⏳ Pending</span>}
                        </p>
                      </div>
                      {order.isDelivered && order.deliveredAt && (
                        <div className="meta-block">
                          <p className="meta-label">🎉 Delivered On</p>
                          <p className="meta-value">
                            {new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Total row */}
                    <div className="order-total-row">
                      <span>Grand Total</span>
                      <strong>₹{order.totalPrice.toFixed(2)}</strong>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
