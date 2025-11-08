import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";



export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setOk("");
    if (!email || !password) { setError("Email and password are required"); return; }

    try {
      setBusy(true);
      const data = await api.login(email, password); // { token, name, role, user_id }
      localStorage.setItem("user", JSON.stringify({ ...data, email }));
      nav("/equipment");
      // later we’ll navigate to dashboard; for now we just show success.
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{maxWidth:380, margin:"60px auto", padding:16, border:"1px solid #e5e7eb", borderRadius:12}}>
      <h1 style={{fontSize:20, fontWeight:600, marginBottom:8}}>Sign in</h1>
      <form onSubmit={submit} style={{display:"grid", gap:12}}>
        <input
          type="email" placeholder="you@school.edu"
          value={email} onChange={(e)=>setEmail(e.target.value)}
          style={{width:"93%", padding:"10px", border:"1px solid #d1d5db", borderRadius:8}}
        />
        <input
          type="password" placeholder="••••••••"
          value={password} onChange={(e)=>setPassword(e.target.value)}
          style={{width:"93%", padding:"10px", border:"1px solid #d1d5db", borderRadius:8}}
        />
        {error && <div style={{color:"#dc2626"}}>{error}</div>}
        {ok && <div style={{color:"#16a34a"}}>{ok}</div>}
        <button disabled={busy}
          style={{padding:"10px", border:"1px solid #000", borderRadius:8, background:"#000", color:"#fff"}}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <p style={{marginTop:10, fontSize:14}}>
        Don't have an account?{" "}
        <span
            style={{color:"#2563eb", cursor:"pointer"}}
            onClick={() => nav("/signup")}
        >
            Sign up
        </span>
        </p>

      </form>
    </div>
  );
}
