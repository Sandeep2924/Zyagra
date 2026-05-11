import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/admins/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("adminInfo", JSON.stringify({ token: data.token, admin: data.admin }));
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <style>{`
        .admin-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          font-family: 'Inter', sans-serif;
          padding: 20px;
        }
        .admin-card {
          background: white;
          width: 100%;
          max-width: 420px;
          padding: 40px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          text-align: center;
        }
        .admin-card h2 {
          font-size: 2rem;
          color: #1e293b;
          margin-bottom: 8px;
          font-weight: 800;
        }
        .admin-card p {
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 30px;
        }
        .form-group {
          text-align: left;
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 8px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .input-container {
          position: relative;
          width: 100%;
        }
        .input-container input {
          width: 100%;
          padding: 14px 16px;
          font-size: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }
        .input-container input:focus {
          border-color: #10b981;
          background: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }
        .pass-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #10b981;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          text-transform: uppercase;
        }
        .error-box {
          background: #fff1f2;
          color: #e11d48;
          padding: 12px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          border: 1px solid #fecdd3;
        }
        .login-btn {
          width: 100%;
          padding: 16px;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .login-btn:hover {
          background: #10b981;
          transform: translateY(-2px);
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .footer-text {
          margin-top: 30px;
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      `}</style>

      <div className="admin-card">
        <h2>ZYAGRA Admin Portal</h2>
        <p>Sign in to access the admin dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-container">
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="pass-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="error-box">⚠️ {error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Verifying..." : "Sign In"}
          </button>   
        </form>

        <div className="footer-text">Admin Access Only</div>
      </div>
    </div>
  );
};

export default AdminLoginPage;