import React,{useState, useEffect} from "react";
import { useCart } from "../context/CartContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";
const cardStyles = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "1rem",
  width: "300px",
  textAlign: "center",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
};

const buttonStyles = {
  cursor: "pointer",
  backgroundColor: "#2c3e50",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  marginTop: "1rem",
  transition: "background-color 0.3s",
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // On mount, check if product is in wishlist
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsWishlisted(wishlist.some((item) => item.id === product.id));
  }, [product.id]);

  // Toggle wishlist on heart click
  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (isWishlisted) {
      // Remove from wishlist
      const updated = wishlist.filter((item) => item.id !== product.id);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setIsWishlisted(false);
    } else {
      // Add to wishlist
      const updated = [...wishlist, product];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setIsWishlisted(true);
    }
  };

  return (
    <div style={cardStyles}>
      <img
        src={product.image}
        alt={product.name}
        style={{ maxWidth: "100%", height: "auto", borderRadius: "4px" }}
      />
      <h3>{product.name}</h3>
      <p> ₹{product.price.toFixed(2)}</p>

      {/* Heart button before Add to Cart */}
      <button
        onClick={toggleWishlist}
        aria-pressed={isWishlisted}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: isWishlisted ? "#e53e3e" : "#888",
          fontSize: "1.5rem",
          marginRight: "10px",
        }}
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
      </button>

      <button style={buttonStyles} onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
