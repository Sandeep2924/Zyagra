import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../style/Navbar.css";

import { FaHeart, FaShoppingCart, FaTimes, FaBars } from "react-icons/fa";
import { FiLogIn, FiLogOut } from "react-icons/fi";

const navLinks = [
  { text: "Products", to: "/products" },
  { text: "About Us", to: "/about" },
  { text: "Contact Us", to: "/contact" },
  { text: "Dashboard", to: "/dashboard", authRequired: true },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMobileMenu = () => setIsMenuOpen(false);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [wishlistCount, setWishlistCount] = useState(0);

  // Load wishlist count on mount
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlistCount(wishlist.length);
  }, []);

  // Clear logout message after 4 seconds
  useEffect(() => {
    if (logoutMessage) {
      const timer = setTimeout(() => setLogoutMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [logoutMessage]);

  // Wrapped logout function for message and closing menu
  const handleLogout = () => {
    logout();
    setLogoutMessage("You have been logged out successfully.");
    closeMobileMenu();
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
            ZYAGRA
          </Link>

          <div className="hamburger" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </div>

          <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
            {navLinks
              .filter((link) => !link.authRequired || (link.authRequired && user))
              .map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="nav-item"
                    onClick={closeMobileMenu}
                  >
                    {link.text}
                  </NavLink>
                </li>
              ))}

            <li className="nav-spacer"></li>

            <li className="nav-action-item">
              <NavLink
                to="/wishlist"
                className="nav-item-cart"
                onClick={closeMobileMenu}
                title="Wishlist"
              >
                <FaHeart />
                {wishlistCount > 0 && (
                  <span className="cart-badge">{wishlistCount}</span>
                )}
              </NavLink>
            </li>

            <li className="nav-action-item">
              <NavLink
                to="/cart"
                className="nav-item-cart"
                onClick={closeMobileMenu}
              >
                <FaShoppingCart />
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </NavLink>
            </li>

            <li className="nav-action-item">
              {user ? (
                <button onClick={handleLogout} className="nav-item-button">
                  <FiLogOut /> Logout
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className="nav-item-button"
                  onClick={closeMobileMenu}
                >
                  <FiLogIn /> Login
                </NavLink>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Logout message displayed below navbar */}
      {logoutMessage && <div className="logout-message">{logoutMessage}</div>}
    </>
  );
};

export default Navbar;
