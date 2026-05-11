import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import "../style/AdminDashboard.css";

import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { API } from "../config/api";

ChartJS.register(
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend
);


// ── helpers ───────────────────────────────────────────────────────────────────
const adminToken = () => {
  try { return JSON.parse(localStorage.getItem("adminInfo"))?.token; }
  catch { return null; }
};

const authHeaders = () => ({
  "Content-Type":  "application/json",
  Authorization:   `Bearer ${adminToken()}`,
});

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// ── Memoised product row — only re-renders when its own product changes ──────
const ProductRow = React.memo(({ p, editStockId, editStockVal, setEditStockId,
  setEditStockVal, handleUpdateStock, handleDeleteProduct, loading, setMessage }) => {
  const stock = p.stock ?? 0;
  return (
    <tr key={p._id} style={{ borderBottom: "1px solid #eee", background: stock === 0 ? "#fff5f5" : "#fff" }}>
      <td style={{ padding: "8px" }}>
        <img src={p.image} alt={p.name}
          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }} />
      </td>
      <td style={{ padding: "8px" }}>{p.name}</td>
      <td style={{ padding: "8px" }}>{p.category}</td>
      <td style={{ padding: "8px" }}>₹{p.price.toFixed(2)}</td>
      <td style={{ padding: "8px" }}>{p.quantity}</td>
      <td style={{ padding: "8px" }}>
        {editStockId === p._id ? (
          <div style={{ display: "flex", gap: "4px" }}>
            <input type="number" value={editStockVal} min="0"
              onChange={(e) => setEditStockVal(e.target.value)}
              style={{ width: "60px", padding: "4px", border: "1px solid #ccc", borderRadius: "4px" }} />
            <button onClick={() => handleUpdateStock(p._id)}
              style={{ padding: "4px 8px", background: "#38A169", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>✓</button>
            <button onClick={() => setEditStockId(null)}
              style={{ padding: "4px 8px", background: "#E53E3E", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>✕</button>
          </div>
        ) : (
          <span
            onClick={() => { setEditStockId(p._id); setEditStockVal(p.stock ?? 0); }}
            style={{ cursor: "pointer", fontWeight: "bold", color: stock <= 5 ? "#E53E3E" : "#2C7A7B" }}
            title="Click to edit stock">
            {stock} units ✏️
          </span>
        )}
      </td>
      <td style={{ padding: "8px" }}>
        {stock === 0
          ? <span style={{ color: "#E53E3E", fontWeight: "bold" }}>❌ Out of Stock</span>
          : stock <= 5
            ? <span style={{ color: "#DD6B20", fontWeight: "bold" }}>⚠️ Low Stock</span>
            : <span style={{ color: "#38A169", fontWeight: "bold" }}>✅ In Stock</span>}
      </td>
      <td style={{ padding: "8px" }}>
        <button onClick={() => handleDeleteProduct(p._id)} disabled={loading}
          style={{ padding: "6px 10px", background: "#E53E3E", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          🗑️ Delete
        </button>
      </td>
    </tr>
  );
}, (prev, next) =>
  // Only re-render this row if its own data or edit state changed
  prev.p._id    === next.p._id    &&
  prev.p.stock  === next.p.stock  &&
  prev.p.price  === next.p.price  &&
  prev.p.name   === next.p.name   &&
  prev.p.image  === next.p.image  &&
  prev.loading        === next.loading &&
  prev.editStockId    === next.editStockId &&
  prev.editStockVal   === next.editStockVal
);


// ── Inline note cell — local draft state, saves on blur or Enter ─────────────
const NoteCell = React.memo(({ order, isTerminal, onSave }) => {
  const [draft,   setDraft]   = React.useState(order.adminNote || "");
  const [saved,   setSaved]   = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  // Keep draft in sync if parent re-fetches (e.g. another admin saved a note)
  React.useEffect(() => {
    if (!focused) setDraft(order.adminNote || "");
  }, [order.adminNote, focused]);

  const handleSave = () => {
    if (draft === (order.adminNote || "")) return; // nothing changed
    onSave(order._id, draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isTerminal) {
    return order.adminNote
      ? <span style={{ fontSize:"0.82em", color:"#744210", background:"#FEFCBF", padding:"4px 8px", borderRadius:6, display:"block" }}>📝 {order.adminNote}</span>
      : <span style={{ color:"#ccc", fontSize:"0.78em" }}>—</span>;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <textarea
        value={draft}
        maxLength={500}
        placeholder="Add a note for the customer…"
        rows={2}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); handleSave(); }}
        onChange={(e) => { setDraft(e.target.value); setSaved(false); }}
        style={{
          width:"100%", padding:"6px 8px", fontSize:"0.8em",
          border:"1px solid #e2e8f0", borderRadius:6, resize:"none",
          outline:"none", fontFamily:"inherit", boxSizing:"border-box",
          background: draft ? "#FEFCBF" : "#fff",
          transition:"border-color 0.15s",
        }}
        onFocusCapture={(e) => (e.target.style.borderColor = "#D69E2E")}
        onBlurCapture={(e)  => (e.target.style.borderColor = "#e2e8f0")}
      />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:"0.68em", color:"#a0aec0" }}>{draft.length}/500</span>
        {saved && <span style={{ fontSize:"0.72em", color:"#38A169", fontWeight:600 }}>✓ Saved</span>}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate   = useNavigate();
  const pollRef    = useRef(null);
  const lastSeenTs = useRef(new Date().toISOString());

  // ── auth ──────────────────────────────────────────────────────────────────
  const [adminInfo, setAdminInfo] = useState(null);

  // ── tabs ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("analytics");

  // ── global feedback ───────────────────────────────────────────────────────
  const [message, setMessage] = useState("");

  // Separate loading flags: analyticsLoading never re-renders product table
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [actionLoading,    setActionLoading]    = useState(false); // add/delete/stock/cancel/deliver
  const loading = actionLoading;

  // ── notifications ─────────────────────────────────────────────────────────
  const [newOrderBadge,  setNewOrderBadge]  = useState(0);
  const [notifHistory,   setNotifHistory]   = useState([]); // {id, total, time}
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // ── analytics state ───────────────────────────────────────────────────────
  const [summary,      setSummary]      = useState(null);
  const [revenueTrend, setRevenueTrend] = useState(null);
  const [ordersTrend,  setOrdersTrend]  = useState(null);
  const [topProducts,  setTopProducts]  = useState([]);
  const [userSignups,  setUserSignups]  = useState(null);
  const [trendDays,    setTrendDays]    = useState(7);

  // ── orders state ──────────────────────────────────────────────────────────
  const [orders,          setOrders]          = useState([]);
  const [cancelOrderId,   setCancelOrderId]   = useState("");
  const [cancelReason,    setCancelReason]    = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Order status pipeline controls
  const [statusOrderId,   setStatusOrderId]   = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [noteOrderId,     setNoteOrderId]     = useState(null);
  const [noteText,        setNoteText]        = useState("");
  const [showNoteModal,   setShowNoteModal]   = useState(false);
  const [orderFilter,     setOrderFilter]     = useState("all"); // all|pending|delivered|cancelled
  const [orderID,         setOrderID]         = useState("");

  // ── products — sourced from ProductContext (same data as user-facing pages)
  const {
    products,
    fetchProducts,
    optimisticAdd,
    optimisticDelete,
    optimisticUpdateStock,
  } = useProducts();

  const [currentPage,  setCurrentPage]  = useState(1);
  const [editStockId,  setEditStockId]  = useState(null);
  const [editStockVal, setEditStockVal] = useState("");
  const productsPerPage = 5;

  const [formData, setFormData] = useState({
    name: "", image: "", description: "",
    price: "", quantity: "", category: "", stock: "",
  });

  // ── auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("adminInfo");
    if (!raw) { navigate("/admin/login", { replace: true }); return; }
    try { setAdminInfo(JSON.parse(raw).admin); }
    catch { navigate("/admin/login", { replace: true }); }
  }, [navigate]);

  // ── notification polling (every 30 s) ────────────────────────────────────
  const pollNewOrders = useCallback(async () => {
    try {
      const res  = await fetch(
        `${API}/api/analytics/new-orders-since?since=${encodeURIComponent(lastSeenTs.current)}`,
        { headers: authHeaders() }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.count > 0) {
        setNewOrderBadge((b) => b + data.count);
        setNotifHistory((h) => [
          ...data.orders.map((o) => ({
            id:    o._id,
            total: o.totalPrice,
            time:  new Date(o.createdAt).toLocaleTimeString(),
          })),
          ...h,
        ].slice(0, 20));

        // Browser push notification
        if (Notification.permission === "granted") {
          data.orders.forEach((o) => {
            new Notification("🛒 New Zyagra Order!", {
              body: `Order #${o._id.slice(0, 8)} — ${fmt(o.totalPrice)}`,
              icon: "/vite.svg",
            });
          });
        }

        lastSeenTs.current = new Date().toISOString();
      }
    } catch { /* silently ignore polling failures */ }
  }, []);

  useEffect(() => {
    if (!adminInfo) return;

    // Request browser notification permission once
    if (Notification.permission === "default") Notification.requestPermission();

    pollRef.current = setInterval(pollNewOrders, 30_000);
    return () => clearInterval(pollRef.current);
  }, [adminInfo, pollNewOrders]);

  // ── fetch analytics ───────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const [sumR, revR, ordR, topR, sigR] = await Promise.all([
        fetch(`${API}/api/analytics/summary`,                           { headers: authHeaders() }),
        fetch(`${API}/api/analytics/revenue-trend?days=${trendDays}`,  { headers: authHeaders() }),
        fetch(`${API}/api/analytics/orders-trend?days=${trendDays}`,   { headers: authHeaders() }),
        fetch(`${API}/api/analytics/top-products?limit=5`,             { headers: authHeaders() }),
        fetch(`${API}/api/analytics/user-signups?days=${trendDays}`,   { headers: authHeaders() }),
      ]);
      setSummary(     await sumR.json());
      setRevenueTrend(await revR.json());
      setOrdersTrend( await ordR.json());
      setTopProducts( await topR.json());
      setUserSignups( await sigR.json());
    } catch (err) {
      setMessage(`❌ Error loading analytics: ${err.message}`);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [trendDays]);

  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
  }, [activeTab, fetchAnalytics]);

  // ── fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/api/orders/allorders`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setOrders(data);
      else throw new Error(data.message);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab, fetchOrders]);

  // products are loaded by ProductContext on mount — no local fetch needed

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("adminInfo");
    // Open the main storefront in a new tab, stay on admin login
    window.open("/", "_blank", "noopener,noreferrer");
    navigate("/admin/login", { replace: true });
  };

  // — Mark delivered —
  const updateOrders = async (e) => {
    e.preventDefault();
    if (!orderID) return setMessage("Please select an order first.");
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/api/orders/updateorder`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ orderId: orderID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      setMessage(`✅ Order marked as delivered!`);
      setOrderID("");
      await fetchOrders();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // — Cancel / reject —
  const openCancelModal = (orderId) => {
    setCancelOrderId(orderId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/api/orders/cancelorder`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ orderId: cancelOrderId, reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      setMessage(`✅ Order cancelled & stock restored.`);
      await fetchOrders();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
      setCancelOrderId("");
    }
  };

  // — Set order status (pipeline advance) —
  const STATUS_LABELS = {
    placed:           "✅ Confirmed",
    confirmed:        "📦 Mark Packed",
    packed:           "🚚 Out for Delivery",
    out_for_delivery: "🎉 Mark Delivered",
    delivered:        null,
    cancelled:        null,
  };
  const NEXT_STATUS = {
    placed:           "confirmed",
    confirmed:        "packed",
    packed:           "out_for_delivery",
    out_for_delivery: "delivered",
  };

  const handleAdvanceStatus = async (orderId, currentStatus, targetStatus) => {
    const next = targetStatus || NEXT_STATUS[currentStatus];
    if (!next) return;
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/api/orders/setstatus`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ orderId, status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(`✅ Order status → ${next.replace(/_/g," ")}`);
      await fetchOrders();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // — Save admin note —
  const handleSaveNote = async () => {
    if (!noteOrderId) return;
    setShowNoteModal(false);
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/api/orders/setnote`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ orderId: noteOrderId, note: noteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("✅ Note saved — visible to customer.");
      await fetchOrders();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
      setNoteOrderId(null);
      setNoteText("");
    }
  };

  // — Add product —
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/api/products`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(`✅ Product "${data.name}" added.`);
      setFormData({ name: "", image: "", description: "", price: "", quantity: "", category: "", stock: "" });
      optimisticAdd({ ...data, id: data._id });
      setCurrentPage(1);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // — Delete product —
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/api/products/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(`✅ "${data.name}" deleted.`);
      optimisticDelete(id);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // — Update stock —
  const handleUpdateStock = async (id) => {
    if (editStockVal === "" || isNaN(Number(editStockVal))) {
      return setMessage("❌ Enter a valid stock number.");
    }
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/api/products/${id}/stock`, {
        method: "PATCH", headers: authHeaders(),
        body: JSON.stringify({ stock: editStockVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(`✅ Stock updated to ${editStockVal} units.`);
      optimisticUpdateStock(id, Number(editStockVal));
      setEditStockId(null);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── derived / filtered data ───────────────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "all")       return true;
    if (orderFilter === "pending")   return o.status === "pending"   || (!o.status && !o.isDelivered);
    if (orderFilter === "delivered") return o.status === "delivered" || o.isDelivered;
    if (orderFilter === "cancelled") return o.status === "cancelled";
    return true;
  });

  // Memoised — only recomputes when products list or page changes,
  // NOT on unrelated state changes (message, notifications, loading flags)
  const totalPages = useMemo(
    () => Math.ceil(products.length / productsPerPage),
    [products.length, productsPerPage]
  );
  const paginatedProducts = useMemo(
    () => products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage),
    [products, currentPage, productsPerPage]
  );

  // ── chart configs ─────────────────────────────────────────────────────────
  const lineOpts = (title) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, title: { display: true, text: title, font: { size: 15 } } },
    scales: { y: { beginAtZero: true } },
  });

  const revenueChartData = revenueTrend && {
    labels: revenueTrend.labels,
    datasets: [{
      label: `Revenue (₹) — last ${trendDays} days`,
      data:  revenueTrend.values,
      borderColor: "#2C7A7B", backgroundColor: "rgba(44,122,123,0.15)",
      tension: 0.3, pointRadius: 5, fill: true,
    }],
  };

  const ordersChartData = ordersTrend && {
    labels: ordersTrend.labels,
    datasets: [{
      label: `Orders — last ${trendDays} days`,
      data:  ordersTrend.values,
      backgroundColor: "rgba(56,161,105,0.7)", borderColor: "#38A169", borderWidth: 1,
    }],
  };

  const signupsChartData = userSignups && {
    labels: userSignups.labels,
    datasets: [{
      label: "New Users",
      data:  userSignups.values,
      backgroundColor: "rgba(214,158,46,0.7)", borderColor: "#D69E2E", borderWidth: 1,
    }],
  };

  const topProductsChartData = topProducts.length > 0 && {
    labels: topProducts.map((p) => p.name),
    datasets: [{
      label: "Units Sold",
      data:  topProducts.map((p) => p.qty),
      backgroundColor: [
        "rgba(44,122,123,0.8)", "rgba(56,161,105,0.8)", "rgba(214,158,46,0.8)",
        "rgba(229,62,62,0.8)",  "rgba(128,90,213,0.8)",
      ],
    }],
  };

  // ── tab styles ────────────────────────────────────────────────────────────
  const tabStyle = (tab) => ({
    padding: "10px 22px", cursor: "pointer", border: "none",
    borderBottom: activeTab === tab ? "3px solid #2C7A7B" : "3px solid transparent",
    backgroundColor: "transparent",
    fontWeight: activeTab === tab ? "bold" : "normal",
    color: activeTab === tab ? "#2C7A7B" : "#555",
    fontSize: "1rem", transition: "all 0.2s",
  });

  const statusBadge = (order) => {
    const s = order.status || (order.isDelivered ? "delivered" : "pending");
    const colours = { pending: "#D69E2E", delivered: "#38A169", cancelled: "#E53E3E" };
    return (
      <span style={{
        padding: "3px 10px", borderRadius: "12px", fontSize: "0.8em",
        backgroundColor: colours[s] + "22", color: colours[s], fontWeight: "bold",
      }}>
        {s.toUpperCase()}
      </span>
    );
  };

  if (!adminInfo) return <div className="admin-container"><p className="loading">Loading…</p></div>;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-container">
      <main className="admin-main-content">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="admin-header">
          <h1 className="admin-title">Zyagra Admin</h1>
          <div className="admin-nav" style={{ display: "flex", alignItems: "center", gap: "12px" }}>

            {/* Notification bell — responsive */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setShowNotifPanel((v) => !v); setNewOrderBadge(0); }}
                className="bell-button"
                title="Order notifications"
                aria-label="Notifications"
              >
                🔔
                {newOrderBadge > 0 && (
                  <span className="bell-badge">
                    {newOrderBadge > 9 ? "9+" : newOrderBadge}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div style={{
                  position: "absolute", right: 0, top: "110%", width: "300px",
                  background: "#fff", border: "1px solid #ddd", borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 999, overflow: "hidden",
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee", fontWeight: "bold", background: "#f9f9f9" }}>
                    Recent Notifications
                  </div>
                  {notifHistory.length === 0 ? (
                    <p style={{ padding: "16px", color: "#888", textAlign: "center" }}>No new orders yet</p>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", maxHeight: "260px", overflowY: "auto" }}>
                      {notifHistory.map((n) => (
                        <li key={n.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0" }}>
                          🛒 <strong>New Order</strong> — {fmt(n.total)}
                          <br /><small style={{ color: "#999" }}>{n.time} · #{n.id.slice(0, 8)}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <h4 style={{ margin: 0, color: "#555" }}>Welcome, {adminInfo.email}</h4>
            <button onClick={handleLogout} className="logout-button">🚪 Logout</button>
          </div>
        </div>

        {/* ── Tab nav ─────────────────────────────────────────────────────── */}
        <nav style={{ borderBottom: "2px solid #eee", marginBottom: "24px" }}>
          <button style={tabStyle("analytics")} onClick={() => setActiveTab("analytics")}>📊 Analytics</button>
          <button style={tabStyle("products")}  onClick={() => setActiveTab("products")}>🛒 Products</button>
          <button style={tabStyle("orders")}    onClick={() => setActiveTab("orders")}>
            📦 Orders ({orders.length})
          </button>
          <button style={tabStyle("stock")}     onClick={() => setActiveTab("stock")}>🏪 Stock</button>
        </nav>

        {/* Global feedback */}
        {message && (
          <div className={`message ${message.includes("✅") ? "success" : "error"}`}
               style={{ marginBottom: "16px" }}>
            {message}
            <button onClick={() => setMessage("")}
              style={{ float: "right", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
          </div>
        )}
        {loading && <p style={{ textAlign: "center", color: "#2C7A7B", fontWeight: "bold" }}>Processing…</p>}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: ANALYTICS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div>
            {/* Trend period selector */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", gap: "8px" }}>
              {[7, 14, 30].map((d) => (
                <button key={d} onClick={() => setTrendDays(d)}
                  style={{
                    padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
                    border: "1px solid #2C7A7B",
                    background: trendDays === d ? "#2C7A7B" : "#fff",
                    color:      trendDays === d ? "#fff"    : "#2C7A7B",
                    fontWeight: "bold",
                  }}>
                  {d}d
                </button>
              ))}
            </div>

            {/* KPI cards */}
            {summary && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "16px", marginBottom: "30px" }}>
                {[
                  { label: "Total Revenue",    value: fmt(summary.totalRevenue),  bg: "#E6FFFA", col: "#2C7A7B" },
                  { label: "Today's Revenue",  value: fmt(summary.todayRevenue),  bg: "#F0FFF4", col: "#38A169" },
                  { label: "Total Orders",     value: summary.totalOrders,        bg: "#FEFCBF", col: "#D69E2E" },
                  { label: "Pending Orders",   value: summary.pendingOrders,      bg: "#FFF5F5", col: "#E53E3E" },
                  { label: "Total Customers",  value: summary.totalUsers,         bg: "#EBF8FF", col: "#3182CE" },
                  { label: "Products",         value: summary.totalProducts,      bg: "#F3E8FF", col: "#805AD5" },
                  { label: "Low Stock ≤5",     value: summary.lowStockCount,      bg: "#FFFAF0", col: "#DD6B20" },
                ].map(({ label, value, bg, col }) => (
                  <div key={label} style={{
                    background: bg, borderRadius: "10px", padding: "18px 14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)", textAlign: "center",
                  }}>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: col, fontWeight: "600" }}>{label}</p>
                    <p style={{ margin: "6px 0 0", fontSize: "1.5rem", fontWeight: "bold", color: col }}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Charts grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {revenueChartData && (
                <div style={{ background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", height: "300px" }}>
                  <Line data={revenueChartData} options={lineOpts("Revenue Trend")} />
                </div>
              )}
              {ordersChartData && (
                <div style={{ background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", height: "300px" }}>
                  <Bar data={ordersChartData} options={lineOpts("Orders Per Day")} />
                </div>
              )}
              {signupsChartData && (
                <div style={{ background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", height: "300px" }}>
                  <Bar data={signupsChartData} options={lineOpts("New User Signups")} />
                </div>
              )}
              {topProductsChartData && (
                <div style={{ background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "260px", height: "260px" }}>
                    <Doughnut data={topProductsChartData} options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { position: "right" }, title: { display: true, text: "Top 5 Products by Units Sold" } },
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Top products table */}
            {topProducts.length > 0 && (
              <div style={{ marginTop: "28px", background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                <h3 style={{ marginTop: 0 }}>🏆 Top Products</h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f4f4f4" }}>
                      <th style={{ padding: "10px", textAlign: "left" }}>Product</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Units Sold</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "10px" }}>#{i + 1} {p.name}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>{p.qty}</td>
                        <td style={{ padding: "10px", textAlign: "right", fontWeight: "bold" }}>{fmt(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: ORDERS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div>
            {/* Filter + deliver form */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
              {["all", "pending", "delivered", "cancelled"].map((f) => (
                <button key={f} onClick={() => setOrderFilter(f)}
                  style={{
                    padding: "6px 14px", borderRadius: "6px", cursor: "pointer", textTransform: "capitalize",
                    border: "1px solid #2C7A7B",
                    background: orderFilter === f ? "#2C7A7B" : "#fff",
                    color:      orderFilter === f ? "#fff"    : "#2C7A7B",
                  }}>
                  {f}
                </button>
              ))}
            </div>

            {/* ── Pipeline status legend ── */}
            <div className="pipeline-legend">
              {["placed","confirmed","packed","out_for_delivery","delivered"].map((s,i,arr) => (
                <React.Fragment key={s}>
                  <span className="pipeline-step">{
                    {placed:"🛒 Placed", confirmed:"✅ Confirmed", packed:"📦 Packed",
                     out_for_delivery:"🚚 Out for Delivery", delivered:"🎉 Delivered"}[s]
                  }</span>
                  {i < arr.length-1 && <span className="pipeline-arrow">→</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Orders table */}
            {filteredOrders.length === 0 ? (
              <p style={{ textAlign: "center", color: "#888", padding: "2rem" }}>No orders found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="orders-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f4f4f4" }}>
                      <th style={{ padding: "10px", textAlign: "left" }}>Order</th>
                      <th style={{ padding: "10px" }}>Customer</th>
                      <th style={{ padding: "10px" }}>Items</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Total</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Status</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Notes</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const s           = order.status || (order.isDelivered ? "delivered" : "placed");
                      const isCancelled = s === "cancelled";
                      const isDelivered = s === "delivered";
                      const isTerminal  = isCancelled || isDelivered;

                      const STATUS_OPTIONS = [
                        { value:"placed",           label:"🛒 Placed" },
                        { value:"confirmed",         label:"✅ Confirmed" },
                        { value:"packed",            label:"📦 Packed" },
                        { value:"out_for_delivery",  label:"🚚 Out for Delivery" },
                        { value:"delivered",         label:"🎉 Delivered" },
                        { value:"cancelled",         label:"❌ Cancelled" },
                      ];

                      const STATUS_PIPELINE_ORDER = ["placed","confirmed","packed","out_for_delivery","delivered"];
                      const currentIdx = STATUS_PIPELINE_ORDER.indexOf(s);

                      const statusBg = {
                        placed:"#FEFCBF", confirmed:"#BEE3F8", packed:"#E9D8FD",
                        out_for_delivery:"#FEEBC8", delivered:"#C6F6D5", cancelled:"#FED7D7"
                      }[s] || "#eee";

                      return (
                        <tr key={order._id} style={{ borderBottom:"1px solid #eee", background: isCancelled?"#fffafa":isDelivered?"#f0fff4":"#fff", verticalAlign:"middle" }}>

                          {/* Order ID + date */}
                          <td style={{ padding:"12px 10px", minWidth:120 }}>
                            <div style={{ fontFamily:"monospace", fontSize:"0.82em", fontWeight:700, color:"#2d3748" }}>
                              #{order._id.slice(-8).toUpperCase()}
                            </div>
                            <div style={{ fontSize:"0.75em", color:"#a0aec0", marginTop:2 }}>
                              {new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                            </div>
                          </td>

                          {/* Customer */}
                          <td style={{ padding:"12px 10px", minWidth:140 }}>
                            <div style={{ fontWeight:700, color:"#2d3748" }}>{order.customerName || "—"}</div>
                            <div style={{ fontSize:"0.82em", color:"#718096", marginTop:2 }}>📞 {order.phone}</div>
                            <div style={{ fontSize:"0.76em", color:"#a0aec0" }}>{order.shippingAddress?.city}</div>
                          </td>

                          {/* Items */}
                          <td style={{ padding:"12px 10px", minWidth:170 }}>
                            {order.orderItems.map((item,i) => (
                              <div key={i} style={{ fontSize:"0.83em", color:"#4a5568", lineHeight:1.5 }}>
                                {item.name} ×{item.qty}
                              </div>
                            ))}
                          </td>

                          {/* Total */}
                          <td style={{ padding:"12px 10px", textAlign:"right", fontWeight:700, whiteSpace:"nowrap", color:"#2d3748" }}>
                            {fmt(order.totalPrice)}
                          </td>

                          {/* Status — dropdown */}
                          <td style={{ padding:"12px 10px", textAlign:"center", minWidth:170 }}>
                            {isTerminal ? (
                              <span style={{
                                display:"inline-block", padding:"5px 12px", borderRadius:20,
                                fontSize:"0.82em", fontWeight:700,
                                background: statusBg, color:"#333",
                              }}>
                                { isCancelled ? "❌ Cancelled" : "🎉 Delivered" }
                              </span>
                            ) : (
                              <select
                                value={s}
                                disabled={loading}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (newStatus === "cancelled") {
                                    openCancelModal(order._id);
                                  } else {
                                    handleAdvanceStatus(order._id, s, newStatus);
                                  }
                                }}
                                style={{
                                  padding:"6px 10px", borderRadius:8, border:"2px solid "+statusBg,
                                  background: statusBg, fontWeight:700, fontSize:"0.82em",
                                  cursor:"pointer", outline:"none", color:"#333",
                                  appearance:"none", WebkitAppearance:"none",
                                 backgroundImage: "url('https://static.investindia.gov.in/s3fs-public/2022-08/pexels-pixabay-207247.jpg')",
                                  backgroundRepeat:"no-repeat", backgroundPosition:"right 8px center",
                                  backgroundSize:"9px", paddingRight:26,
                                }}
                              >
                                {STATUS_OPTIONS.map(opt => {
                                  const optIdx = STATUS_PIPELINE_ORDER.indexOf(opt.value);
                                  // Only show current + forward options + cancelled
                                  const reachable = opt.value === "cancelled" || optIdx >= currentIdx;
                                  return reachable ? (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ) : null;
                                })}
                              </select>
                            )}
                            {isCancelled && order.cancelReason && (
                              <div style={{ fontSize:"0.72em", color:"#999", marginTop:4 }}>{order.cancelReason}</div>
                            )}
                          </td>

                          {/* Notes column — inline textarea + save */}
                          <td style={{ padding:"12px 10px", minWidth:200 }}>
                            <NoteCell
                              order={order}
                              isTerminal={isTerminal}
                              onSave={async (orderId, note) => {
                                setActionLoading(true);
                                try {
                                  const res = await fetch(`${API}/api/orders/setnote`, {
                                    method:"POST", headers:authHeaders(),
                                    body:JSON.stringify({ orderId, note }),
                                  });
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data.message);
                                  setMessage("✅ Note saved — visible to customer.");
                                  await fetchOrders();
                                } catch(err) {
                                  setMessage(`❌ ${err.message}`);
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                            />
                          </td>

                          {/* Actions — Reject only */}
                          <td style={{ padding:"12px 10px", textAlign:"center", minWidth:80 }}>
                            {!isTerminal && (
                              <button onClick={() => openCancelModal(order._id)} disabled={loading}
                                style={{ padding:"6px 12px", background:"#E53E3E", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:"0.82em", fontWeight:600, whiteSpace:"nowrap" }}>
                                ✕ Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: PRODUCTS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "products" && (
          <div>
            {/* Add form */}
            <form onSubmit={handleAddProduct} className="product-form" style={{ marginBottom: "36px" }}>
              <h2>Add New Product</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" name="name" value={formData.name} required
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Organic Tomatoes" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" name="category" value={formData.category} required
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Vegetables" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" name="price" value={formData.price} required min="0" step="0.01"
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Quantity Label</label>
                  <input type="text" name="quantity" value={formData.quantity} required
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. 500g, 1 dozen" />
                </div>
                <div className="form-group">
                  <label>Stock (units)</label>
                  <input type="number" name="stock" value={formData.stock} required min="0"
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="e.g. 50" />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="url" name="image" value={formData.image} required
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://…" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} required rows="3"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description…" />
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Adding…" : "➕ Add Product"}
              </button>
            </form>

            {/* Product table */}
            <h3>All Products ({products.length}) — Page {currentPage}/{totalPages || 1}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f4f4f4" }}>
                  {["Image","Name","Category","Price","Unit","Stock","Status","Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px", border: "1px solid #eee", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => (
                  <ProductRow
                    key={p._id}
                    p={p}
                    editStockId={editStockId}
                    editStockVal={editStockVal}
                    setEditStockId={setEditStockId}
                    setEditStockVal={setEditStockVal}
                    handleUpdateStock={handleUpdateStock}
                    handleDeleteProduct={handleDeleteProduct}
                    loading={loading}
                    setMessage={setMessage}
                  />
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{ padding: "8px 16px", background: "#2C7A7B", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}>
                Previous
              </button>
              <span style={{ lineHeight: "36px" }}>Page {currentPage} / {totalPages || 1}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
                style={{ padding: "8px 16px", background: "#2C7A7B", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", opacity: currentPage >= totalPages ? 0.5 : 1 }}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: STOCK (inventory-focused view)
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "stock" && (
          <div>
            <h2>📦 Inventory Control Panel</h2>
            <p style={{ color: "#666" }}>Click any stock number to edit it directly. Red rows = out of stock, orange = low stock (≤5).</p>

            {products.length === 0 && (
              <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No products in database yet. Add one from the Products tab.</p>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
              <thead>
                <tr style={{ background: "#2C7A7B", color: "#fff" }}>
                  {["Product","Category","Unit Label","Stock (units)","Status","Quick Edit"].map((h) => (
                    <th key={h} style={{ padding: "12px", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...products].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)).map((p) => {
                  const stock = p.stock ?? 0;
                  const rowBg = stock === 0 ? "#fff5f5" : stock <= 5 ? "#fffbf0" : "#fff";
                  return (
                    <tr key={p._id} style={{ borderBottom: "1px solid #eee", background: rowBg }}>
                      <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={p.image} alt={p.name}
                          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                          onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }} />
                        <strong>{p.name}</strong>
                      </td>
                      <td style={{ padding: "12px" }}>{p.category}</td>
                      <td style={{ padding: "12px", color: "#888" }}>{p.quantity}</td>
                      <td style={{ padding: "12px", fontWeight: "bold", fontSize: "1.1em",
                                   color: stock === 0 ? "#E53E3E" : stock <= 5 ? "#DD6B20" : "#2C7A7B" }}>
                        {stock}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {stock === 0
                          ? <span style={{ color: "#E53E3E", fontWeight: "bold" }}>❌ Out of Stock</span>
                          : stock <= 5
                            ? <span style={{ color: "#DD6B20", fontWeight: "bold" }}>⚠️ Low</span>
                            : <span style={{ color: "#38A169" }}>✅ OK</span>}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {editStockId === p._id ? (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <input type="number" value={editStockVal} min="0" autoFocus
                              onChange={(e) => setEditStockVal(e.target.value)}
                              style={{ width: "70px", padding: "6px", border: "2px solid #2C7A7B", borderRadius: "6px" }} />
                            <button onClick={() => handleUpdateStock(p._id)}
                              style={{ padding: "6px 12px", background: "#38A169", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Save</button>
                            <button onClick={() => setEditStockId(null)}
                              style={{ padding: "6px 12px", background: "#aaa", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditStockId(p._id); setEditStockVal(stock); }}
                            style={{ padding: "6px 14px", background: "#EBF8FF", color: "#3182CE", border: "1px solid #3182CE", borderRadius: "6px", cursor: "pointer" }}>
                            ✏️ Edit Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* ── Admin Note Modal ─────────────────────────────────────────────────── */}
      {showNoteModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#fff", borderRadius:12, padding:32, width:420, boxShadow:"0 16px 48px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin:"0 0 12px", color:"#D69E2E" }}>📝 Add Note to Order</h3>
            <p style={{ color:"#666", fontSize:"0.9rem", marginBottom:12 }}>
              This note will be visible to the customer on their order tracking page.<br/>
              Notes can only be set before the order is packed.
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              maxLength={500}
              placeholder="e.g. Your order is being specially packed with an ice bag."
              rows="4"
              style={{ width:"100%", padding:10, border:"1px solid #ddd", borderRadius:6, resize:"vertical", boxSizing:"border-box", fontSize:"0.95rem" }}
            />
            <div style={{ fontSize:"0.78rem", color:"#aaa", textAlign:"right" }}>{noteText.length}/500</div>
            <div style={{ display:"flex", gap:12, marginTop:16, justifyContent:"flex-end" }}>
              <button onClick={() => setShowNoteModal(false)}
                style={{ padding:"10px 20px", background:"#eee", border:"none", borderRadius:6, cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={handleSaveNote}
                style={{ padding:"10px 20px", background:"#D69E2E", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontWeight:"bold" }}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel / Reject Modal ───────────────────────────────────────────── */}
      {showCancelModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: "12px", padding: "32px",
            width: "420px", boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
          }}>
            <h3 style={{ margin: "0 0 12px", color: "#E53E3E" }}>✕ Reject / Cancel Order</h3>
            <p style={{ color: "#666", marginBottom: "16px" }}>
              Order <strong>#{cancelOrderId.slice(0, 10)}…</strong> will be cancelled and
              stock will be automatically restored.
            </p>
            <label style={{ fontWeight: "600" }}>Reason (optional)</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Item out of stock, Customer requested cancellation…"
              rows="3"
              style={{ width: "100%", marginTop: "8px", padding: "10px", border: "1px solid #ddd", borderRadius: "6px", resize: "vertical", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCancelModal(false)}
                style={{ padding: "10px 20px", background: "#eee", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                Go Back
              </button>
              <button onClick={confirmCancel}
                style={{ padding: "10px 20px", background: "#E53E3E", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
