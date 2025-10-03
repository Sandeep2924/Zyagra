import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/AdminDashboard.css";

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const storedAdminInfo = localStorage.getItem("adminInfo");
    if (!storedAdminInfo) {
      navigate("/admin/login", { replace: true });
      return;
    }
    
    try {
      const parsed = JSON.parse(storedAdminInfo);
      setAdminInfo(parsed.admin);
    } catch (error) {
      console.error("Error parsing admin info:", error);
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    // Clear message when user starts typing
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const storedAdminInfo = JSON.parse(localStorage.getItem("adminInfo"));
      
      if (!storedAdminInfo || !storedAdminInfo.token) {
        throw new Error("You are not authorized. Please login again.");
      }

      const response = await fetch("http://localhost:5001/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedAdminInfo.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      setMessage(`✅ Successfully added product: ${data.name || formData.name}`);
      
      // Clear the form
      setFormData({
        name: "",
        image: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
      });

    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminInfo");
    navigate("/admin/login", { replace: true });
  };

  if (!adminInfo) {
    return (
      <div className="admin-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>ZYAGRA Admin</h2>
          <p>Welcome, {adminInfo.email}</p>
        </div>
        
        <nav className="admin-nav">
          <ul>
            <li className="active">
              <a href="#products">📦 Manage Products</a>
            </li>
            <li>
              <a href="#orders">📋 Orders</a>
            </li>
            <li>
              <a href="#users">👥 Users</a>
            </li>
            <li>
              <a href="#analytics">📊 Analytics</a>
            </li>
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <div className="admin-header">
          <h1>Product Management</h1>
          <p>Add new products to your store</p>
        </div>

        <div className="product-form-container">
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Electronics, Clothing"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 500g, 1 piece"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="4"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Adding Product..." : "➕ Add Product"}
            </button>
          </form>

          {message && (
            <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;