// API URL configuration - works for both development and production
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Example usage in your components:
// const fetchProducts = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/api/products`);
//     // ... the rest of your logic
//   } catch (error) {
//     console.error("Error fetching products:", error);
//   }
// };