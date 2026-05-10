import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    const id = product._id || product.id;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, id, quantity: 1 }];
    });
  };

  // removeAll=true removes item completely, false decrements qty
  const removeFromCart = (productId, removeAll = true) => {
    setCartItems(prev => {
      if (removeAll) return prev.filter(item => item.id !== productId);
      return prev
        .map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0);
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0), 0).toFixed(2);
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, getCartTotal, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
