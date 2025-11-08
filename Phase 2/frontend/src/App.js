import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Guard from "./components/Guard";           // redirects to /login if not logged in

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Equipment from "./pages/Equipment";
import MyRequests from "./pages/MyRequests";
import Admin from "./pages/Admin";

// Simple inline role guard: only allow admins/staff
function RoleGuard({ allow, children }) {
  if (!allow) return <Navigate to="/equipment" replace />;
  return children;
}

export default function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const loggedIn = !!user;
  const canAdmin = user && (user.role === "admin" || user.role === "staff");

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Auth-required routes */}
          <Route
            path="/equipment"
            element={
              <Guard>
                <Equipment />
              </Guard>
            }
          />
          <Route
            path="/my"
            element={
              <Guard>
                <MyRequests />
              </Guard>
            }
          />
          <Route
            path="/admin"
            element={
              <Guard>
                <RoleGuard allow={canAdmin}>
                  <Admin />
                </RoleGuard>
              </Guard>
            }
          />

          {/* Default redirect */}
          <Route
            path="*"
            element={loggedIn ? <Navigate to="/equipment" replace /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
