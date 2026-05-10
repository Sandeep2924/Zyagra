import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FiTrash2 } from "react-icons/fi";
import "../style/CartPage.css";

const Cart = () => {
  const { cartItems, addToCart, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleIncrease = (item) => addToCart(item);
  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      removeFromCart(item.id, false);
    } else {
      removeFromCart(item.id, true);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some fresh groceries to get started!</p>
        <Link to="/products" className="go-shopping">Shop Now</Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const delivery = subtotal > 499 ? 0 : 49;

  return (
    <div className="cart-page">
      <h1>My Cart</h1>
      <div className="cart-layout">
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} onError={(e) => { e.target.src = "https://via.placeholder.com/90x90?text=🥦"; }} />
              <div>
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">₹{item.price}</div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => handleDecrease(item)}>−</button>
                  <span className="qty-count">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => handleIncrease(item)}>+</button>
                </div>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.id, true)} title="Remove">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span></div>
          {delivery > 0 && <div className="summary-row" style={{ fontSize: "0.8rem", color: "var(--green)" }}><span>Add ₹{499 - subtotal} more for free delivery</span></div>}
          <div className="summary-total"><span>Total</span><span>₹{subtotal + delivery}</span></div>
          <button className="checkout-btn" onClick={() => navigate("/checkout")}>Proceed to Checkout →</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
