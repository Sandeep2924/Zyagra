import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";

const ProductList = () => {
  const location        = useLocation();
  const initialCategory = location.state?.selectedCategory || "All";

  const { productsByCategory, categories, loading, error, fetchProducts } =
    useProducts();

  const [searchTerm,        setSearchTerm]        = useState("");
  const [selectedCategory,  setSelectedCategory]  = useState(initialCategory);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = productsByCategory
    .filter(
      (group) =>
        selectedCategory === "All" ||
        group.categoryName === selectedCategory
    )
    .map((group) => ({
      ...group,
      products: group.products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.products.length > 0);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div style={{
          width: 48, height: 48,
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #2C7A7B",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ color: "#718096" }}>Loading fresh products…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "#c53030", fontSize: "1.1rem" }}>⚠️ {error}</p>
        <button
          onClick={() => fetchProducts()}
          style={{
            marginTop: "1rem", padding: "10px 24px",
            background: "#2C7A7B", color: "#fff",
            border: "none", borderRadius: "8px", cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "1rem 2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem", color: "#2d3748" }}>
        Our Products
      </h1>

      {/* Search bar */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search for any product…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "50%", maxWidth: 600, padding: "12px 20px",
            fontSize: 16, borderRadius: 50, border: "2px solid #ddd", outline: "none",
          }}
          onFocus={(e)  => (e.target.style.borderColor = "#2C7A7B")}
          onBlur={(e)   => (e.target.style.borderColor = "#ddd")}
        />
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.8rem", marginBottom: "2.5rem" }}>
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "9px 20px", fontSize: 15, cursor: "pointer",
                borderRadius: 50, border: "2px solid #2C7A7B",
                background:  active ? "#2C7A7B" : "#fff",
                color:       active ? "#fff"    : "#2C7A7B",
                fontWeight:  active ? "bold"    : "normal",
                transition:  "all 0.2s",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product groups */}
      {filtered.length > 0 ? (
        filtered.map((group) => (
          <div key={group.categoryName} style={{ marginBottom: "3rem" }}>
            <h2
              style={{
                marginLeft: "1rem",
                borderBottom: "2px solid #2C7A7B",
                display: "inline-block",
                paddingBottom: "0.4rem",
                color: "#2d3748",
              }}
            >
              {group.categoryName}
            </h2>
            <div
              style={{
                display: "flex", flexWrap: "wrap",
                justifyContent: "center", gap: "2rem", marginTop: "1.5rem",
              }}
            >
              {group.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "2rem" }}>🔍</p>
          <h3>No products found</h3>
          <p style={{ color: "#718096" }}>Try a different search or category.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
