import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/AdminLoginPage.css";

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/admins/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("adminInfo", JSON.stringify(data));
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <form onSubmit={handleSubmit} className="admin-login-form">
        <div className="admin-badge">🛠️ Admin Panel</div>
        <h2>Admin Login</h2>
        <p>Restricted access — authorized personnel only.</p>

        <div className="input-group">
          <label>Email</label>
          <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="admin@zyagra.com" required />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Enter password" required />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="admin-login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login to Dashboard"}
        </button>

        <div className="form-footer">
          <Link to="/login">← Back to User Login</Link>
        </div>
      </form>
    </div>
  );
};

export default AdminLoginPage;
