import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/SignUpPage.css";
import { API } from "../config/api"; // Import your API constant

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setAgreedToTerms(checked);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- Validation ---
    const { fullName, email, phone, password, confirmPassword, address, city, postalCode } = formData;

    if (!fullName || !email || !password || !phone || !address || !city || !postalCode) {
      return setError("Please fill out all required fields.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    if (!agreedToTerms) {
      return setError("You must agree to the Terms of Service.");
    }

    setLoading(true);

    try {
      // FIX: Use the API constant and dynamic data
      const response = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          address,
          city,
          postalCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess("Account created successfully! Redirecting...");
      
      // Clear form on success
      setFormData({
        fullName: "", email: "", phone: "", password: "",
        confirmPassword: "", address: "", city: "", postalCode: ""
      });

      setTimeout(() => navigate("/login"), 2500);

    } catch (err) {
      setError(err.message === "Failed to fetch" 
        ? "Server is currently unreachable. Please try again later." 
        : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Create Your Account</h2>
        <p>Join ZYAGRA for fast and fresh grocery delivery!</p>

        <div className="input-group">
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Sanjay Shetty" required />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
        </div>

        <div className="input-group">
          <label htmlFor="phone">Phone Number</label>
          <input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} placeholder="9840011111" required />
        </div>

        <div className="input-group">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} placeholder="1, Main Road" required />
        </div>

        <div className="input-row" style={{ display: 'flex', gap: '10px' }}>
          <div className="input-group">
            <label htmlFor="city">City</label>
            <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} placeholder="Delhi" required />
          </div>
          <div className="input-group">
            <label htmlFor="postalCode">Postal Code</label>
            <input id="postalCode" name="postalCode" type="text" value={formData.postalCode} onChange={handleChange} placeholder="201003" required />
          </div>
        </div>

        <div className="input-group password-group" style={{ position: 'relative' }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 6 characters"
            required
          />
          <button type="button" className="password-toggle" onClick={() => setPasswordVisible(!passwordVisible)} style={{ position: 'absolute', right: '10px', top: '35px', background: 'none', border: 'none' }}>
            {passwordVisible ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={passwordVisible ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            required
          />
        </div>

        <div className="terms-container" style={{ margin: '15px 0' }}>
          <input type="checkbox" id="terms" checked={agreedToTerms} onChange={handleChange} style={{ width: 'auto', marginRight: '10px' }} />
          <label htmlFor="terms" style={{ display: 'inline' }}>
            I agree to the <Link to="/terms" target="_blank">Terms of Service</Link>
          </label>
        </div>

        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
        {success && <p className="success-message" style={{ color: 'green' }}>{success}</p>}

        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? "Processing..." : "Create Account"}
        </button>

        <div className="form-footer">
          <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </form>
    </div>
  );
};

export default SignUpPage;