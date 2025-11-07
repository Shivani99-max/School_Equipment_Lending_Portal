import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function Guard({ children }) {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("user");
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
