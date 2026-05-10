import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added,        setAdded]        = useState(false); // brief feedback

  const inStock  = (product.stock ?? 1) > 0; // treat undefined stock as in-stock (legacy)
  const lowStock = inStock && (product.stock ?? 999) <= 5;

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsWishlisted(wishlist.some((item) => item.id === product.id));
  }, [product.id]);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (isWishlisted) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist.filter((i) => i.id !== product.id)));
      setIsWishlisted(false);
    } else {
      localStorage.setItem("wishlist", JSON.stringify([...wishlist, product]));
      setIsWishlisted(true);
    }
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({ ...product, id: product._id || product.id });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      style={{
        border:          "1px solid #e2e8f0",
        borderRadius:    12,
        padding:         "1rem",
        width:           260,
        textAlign:       "center",
        boxShadow:       "0 4px 12px rgba(0,0,0,0.08)",
        display:         "flex",
        flexDirection:   "column",
        justifyContent:  "space-between",
        backgroundColor: inStock ? "#fff" : "#fafafa",
        opacity:         inStock ? 1 : 0.85,
        transition:      "transform 0.2s, box-shadow 0.2s",
        position:        "relative",
        overflow:        "hidden",
      }}
      onMouseEnter={(e) => inStock && (e.currentTarget.style.transform = "translateY(-4px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* Out-of-stock ribbon */}
      {!inStock && (
        <div style={{
          position:   "absolute", top: 14, right: -22,
          background: "#E53E3E", color: "#fff",
          fontSize:   "0.65rem", fontWeight: 700,
          padding:    "4px 28px", transform: "rotate(35deg)",
          letterSpacing: "0.05em",
        }}>
          SOLD OUT
        </div>
      )}

      {/* Low stock badge */}
      {lowStock && (
        <div style={{
          position:   "absolute", top: 10, left: 10,
          background: "#FEFCBF", color: "#B7791F",
          fontSize:   "0.68rem", fontWeight: 700,
          padding:    "3px 8px", borderRadius: 20,
          border:     "1px solid #F6E05E",
        }}>
          Only {product.stock} left!
        </div>
      )}

      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "100%", height: 180, objectFit: "cover",
          borderRadius: 8, marginBottom: 10,
          filter: inStock ? "none" : "grayscale(40%)",
        }}
        onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }}
      />

      {/* Info */}
      <div>
        <h3 style={{ fontSize: "1rem", marginBottom: "0.3rem", color: "#2d3748" }}>
          {product.name}
        </h3>
        {product.quantity && (
          <p style={{ fontSize: "0.8rem", color: "#a0aec0", margin: "0 0 4px" }}>
            {product.quantity}
          </p>
        )}
        <p style={{ fontWeight: "bold", color: "#2C7A7B", marginBottom: "0.4rem", fontSize: "1.1rem" }}>
          ₹{parseFloat(product.price).toFixed(2)}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8 }}>
        {/* Wishlist */}
        <button
          onClick={toggleWishlist}
          aria-pressed={isWishlisted}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: isWishlisted ? "#e53e3e" : "#bbb", fontSize: "1.4rem",
          }}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {isWishlisted ? <FaHeart /> : <FaRegHeart />}
        </button>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          style={{
            cursor:          inStock ? "pointer" : "not-allowed",
            background:      inStock ? (added ? "#38A169" : "#2C7A7B") : "#e2e8f0",
            color:           inStock ? "#fff" : "#a0aec0",
            border:          "none",
            padding:         "9px 22px",
            borderRadius:    6,
            fontWeight:      600,
            fontSize:        "0.9rem",
            transition:      "background 0.2s",
            flex:            1,
          }}
        >
          {!inStock ? "Out of Stock" : added ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
