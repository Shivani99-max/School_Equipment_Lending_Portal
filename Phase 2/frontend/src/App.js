import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Equipment from "./pages/Equipment";
import MyRequests from "./pages/MyRequests";
import Guard from "./components/Guard";

export default function App() {
  const loggedIn = !!localStorage.getItem("user");
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/equipment" element={<Guard><Equipment /></Guard>} />
          <Route path="/my" element={<Guard><MyRequests /></Guard>} />
          <Route
            path="*"
            element={loggedIn ? <Navigate to="/equipment" replace /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
