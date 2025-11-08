import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("user");
    nav("/login");
  };

  return (
    <header style={{
      padding:"12px 20px",
      background:"#111",
      color:"#fff",
      width:"100%"
    }}>
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        width:"100%"
      }}>
        
        {/* LEFT */}
        <div style={{fontWeight:600, fontSize:"18px"}}>
          School Equipment Lending Portal
        </div>

        {/* RIGHT (only show after login) */}
        {user && (
          <nav style={{display:"flex", gap:"32px", paddingRight:"40px"}}>
            <Link to="/equipment" style={{color:"#fff", textDecoration:"none"}}>Equipments</Link>
            <Link to="/my" style={{color:"#fff", textDecoration:"none"}}>My Requests</Link>

            {/* LOGOUT BUTTON */}
            <span
              onClick={logout}
              style={{color:"#fff", textDecoration:"none", cursor:"pointer"}}
            >
              Logout
            </span>
          </nav>
        )}
      </div>
    </header>
  );
}
