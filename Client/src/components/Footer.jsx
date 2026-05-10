import React from "react";
import { Link } from "react-router-dom";
import "../style/Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-grid">
      <div>
        <div className="footer-brand">ZY<span>AG</span>RA</div>
        <p className="footer-desc">Fresh groceries delivered to your door. Quality you can taste, prices you'll love.</p>
      </div>
      <div className="footer-col">
        <h4>Shop</h4>
        <ul>
          <li><Link to="/products">All Products</Link></li>
          <li><Link to="/products">Fruits & Veggies</Link></li>
          <li><Link to="/products">Dairy & Bakery</Link></li>
          <li><Link to="/products">Snacks</Link></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Company</h4>
        <ul>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/support">Support</Link></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Account</h4>
        <ul>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/signup">Sign Up</Link></li>
          <li><Link to="/myorders">My Orders</Link></li>
          <li><Link to="/cart">Cart</Link></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} Zyagra. All rights reserved. Made with 💚 for fresh living.</p>
    </div>
  </footer>
);

export default Footer;
