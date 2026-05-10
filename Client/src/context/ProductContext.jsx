/**
 * ProductContext.jsx
 *
 * Single source of truth for ALL product data in the app.
 * Both the user-facing ProductList/HomePage and the AdminDashboard
 * read from — and write to — this same context, so every change
 * (add, delete, stock update) is instantly reflected everywhere
 * without a page refresh.
 *
 * Polling: re-fetches from the DB every 30 seconds so that admin
 * changes made in another browser tab / device appear live for
 * users within half a minute.
 */

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";

import { API } from "../config/api";
const POLL_INTERVAL = 30_000; // 30 seconds

const ProductContext = createContext(null);

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
};

export const ProductProvider = ({ children }) => {
  const [products,  setProducts]  = useState([]);   // flat array from DB
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const pollRef = useRef(null);

  // ── Fetch all products from DB ─────────────────────────────────────────────
  // productsRef lets the poll compare incoming data against current state
  // without needing products in the dependency array (which would cause
  // the interval to reset on every render).
  const productsRef = useRef([]);

  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res  = await fetch(`${API}/api/products`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load products");

      // ── Smart diff: only call setProducts when something actually changed ──
      // This prevents React from unmounting/remounting every <img> on each
      // 30-second poll when the product list hasn't changed at all.
      const prev = productsRef.current;
      const changed =
        data.length !== prev.length ||
        data.some((p, i) => {
          const q = prev[i];
          return !q ||
            q._id !== p._id ||
            q.stock !== p.stock ||
            q.price !== p.price ||
            q.name  !== p.name  ||
            q.image !== p.image;
        });

      if (changed) {
        productsRef.current = data;
        setProducts(data);
      }
      setError("");
    } catch (err) {
      if (!silent) setError(err.message);
      // silently ignore poll failures — don't clear existing products
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ── Initial load + polling ─────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
    pollRef.current = setInterval(() => fetchProducts(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchProducts]);

  // ── Derived: group products by category (for ProductList / HomePage) ───────
  const productsByCategory = React.useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cat = p.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push({
        id:          p._id,         // normalise _id → id for CartContext
        _id:         p._id,
        name:        p.name,
        image:       p.image,
        price:       p.price,
        quantity:    p.quantity,
        description: p.description,
        category:    p.category,
        stock:       p.stock ?? 0,
      });
    });
    // Return sorted category list
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([categoryName, items]) => ({ categoryName, products: items }));
  }, [products]);

  // ── Categories list (for filter buttons) ──────────────────────────────────
  const categories = React.useMemo(
    () => ["All", ...productsByCategory.map((g) => g.categoryName)],
    [productsByCategory]
  );

  // ── Optimistic helpers (used by AdminDashboard so UI updates instantly) ────
  const optimisticAdd = (product) =>
    setProducts((prev) => [{ ...product, id: product._id }, ...prev]);

  const optimisticDelete = (id) =>
    setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));

  const optimisticUpdateStock = (id, stock) =>
    setProducts((prev) =>
      prev.map((p) => (p._id === id || p.id === id) ? { ...p, stock } : p)
    );

  return (
    <ProductContext.Provider
      value={{
        products,           // flat array
        productsByCategory, // grouped for display
        categories,
        loading,
        error,
        fetchProducts,
        optimisticAdd,
        optimisticDelete,
        optimisticUpdateStock,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
