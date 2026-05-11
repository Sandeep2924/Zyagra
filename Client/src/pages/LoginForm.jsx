import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/LoginPage.css";
import { useAuth } from "../context/AuthContext";
// Import your API constant (adjust the path to where your config file is)
import { API } from "../config/api"; 

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use your exported API constant here
      const response = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Success logic
      localStorage.setItem("userInfo", JSON.stringify(data));
      login(data);
      navigate("/", { state: { message: data.message } });
      
    } catch (err) {
      // Handle deployment-related fetch errors
      if (err.message === "Failed to fetch") {
        setError("Network error: Please check if the backend server is running.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Log In to Your Account</h2>
        <p>Welcome back to ZYAGRA!</p>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && <p className="error-message" style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}
        
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Authenticating..." : "Log In"}
        </button>

        <div className="form-footer">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
          <p className="admin-link">Are you an administrator? <Link to="/admin/login">Admin Login</Link></p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;