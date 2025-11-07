import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("student"); // now editable by dropdown
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setOk("");

    try {
      setBusy(true);
      await api.signup(name, email, password, role);
      setOk("Account created. Please login.");
      setTimeout(() => nav("/login"), 1000);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    width:"95%",
    padding:"6px 8px",
    border:"1px solid #d1d5db",
    borderRadius:6,
    fontSize:"14px",
    margin:"0 auto"
  };

  return (
    <div style={{maxWidth:380, margin:"60px auto", padding:16, border:"1px solid #e5e7eb", borderRadius:12}}>
      <h1 style={{fontSize:20, fontWeight:600, marginBottom:8}}>Sign up</h1>

      <form onSubmit={submit} style={{display:"grid", gap:12}}>
        <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={inputStyle} />

        {/* ROLE DROPDOWN ADDED HERE */}
        <select
        value={role}
        onChange={e=>setRole(e.target.value)}
        style={{ ...inputStyle, width:"100%" }}   // wider here
        >
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        {/* END ROLE DROPDOWN */}

        <input type="email" placeholder="you@school.edu" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle} />

        {error && <div style={{color:"#dc2626"}}>{error}</div>}
        {ok && <div style={{color:"#16a34a"}}>{ok}</div>}

        <button
          disabled={busy}
          style={{padding:"10px", border:"1px solid #000", borderRadius:8, background:"#000", color:"#fff"}}
        >
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>

      <p style={{marginTop:10,fontSize:14}}>
        Already have an account?{" "}
        <span style={{color:"#2563eb", cursor:"pointer"}}
          onClick={() => nav("/login")}
        >
          Sign in
        </span>
      </p>
    </div>
  );
}
