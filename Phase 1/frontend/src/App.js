import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Equipment from "./pages/Equipment";
import Guard from "./components/Guard";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/equipment"
            element={
              <Guard>
                <Equipment />
              </Guard>
            }
          />

          {/* default: if logged in go to /equipment, else /login */}
          <Route
            path="*"
            element={
              localStorage.getItem("user")
                ? <Navigate to="/equipment" replace />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
