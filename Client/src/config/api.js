// API URL configuration - works for both development and production
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Export API for backward compatibility
export const API = API_URL;