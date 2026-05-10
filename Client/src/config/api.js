/**
 * api.js — Central API base URL
 *
 * In development: Vite proxies /api → localhost:5001 automatically.
 * In production:  set VITE_API_URL=https://your-backend.com in .env
 *
 * Import this instead of hardcoding "http://localhost:5001" everywhere.
 *
 * Usage:
 *   import { API } from "../config/api";
 *   fetch(`${API}/api/products`)
 */

export const API = import.meta.env.VITE_API_URL || "";
