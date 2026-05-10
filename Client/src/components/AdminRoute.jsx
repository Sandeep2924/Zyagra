import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const adminInfo = localStorage.getItem("adminInfo");
  if (!adminInfo) return <Navigate to="/admin/login" replace />;
  try {
    const parsed = JSON.parse(adminInfo);
    if (!parsed.token) return <Navigate to="/admin/login" replace />;
  } catch {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};

export default AdminRoute;
