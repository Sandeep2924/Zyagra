import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/SignUpPage.css";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // --- NEW STATES ---
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // NEW: For loading indicator
  const [passwordVisible, setPasswordVisible] = useState(false); // NEW: For password toggle
  const [agreedToTerms, setAgreedToTerms] = useState(false); // NEW: For terms checkbox

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox separately
    if (type === "checkbox") {
      setAgreedToTerms(checked);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    // CHANGED: Made async for API call
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- Validation ---
    if (!formData.fullName || !formData.email || !formData.password) {
      return setError("Please fill out all fields.");
    }
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    // NEW: Check if terms are agreed to
    if (!agreedToTerms) {
      return setError("You must agree to the Terms of Service to continue.");
    }

    setLoading(true); // NEW: Start loading

    // --- API Call Logic (Placeholder replaced with real logic) ---
    try {
      // This is the fetch call to your backend server
      const response = await fetch("http://localhost:5001/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account.");
      }

      setSuccess(data.message + " Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // NEW: Stop loading, whether it succeeded or failed
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Create Your Account</h2>
        <p>Join ZYAGRA for fast and fresh grocery delivery!</p>

        <div className="input-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g., Rohan Kumar"
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
        </div>

        {/* --- CHANGED: Password fields now have a toggle button --- */}
        <div className="input-group password-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"} // Type changes based on state
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="input-group password-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={passwordVisible ? "text" : "password"} // Also toggles here
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
          />
        </div>

        {/* --- NEW: Terms of Service Checkbox --- */}
        <div className="input-group terms-group">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={handleChange}
          />
          <label htmlFor="terms">
            I agree to the{" "}
            <Link to="/terms" target="_blank">
              Terms of Service
            </Link>
          </label>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {/* --- CHANGED: Button now shows loading state --- */}
        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="form-footer">
          <p>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUpPage;
