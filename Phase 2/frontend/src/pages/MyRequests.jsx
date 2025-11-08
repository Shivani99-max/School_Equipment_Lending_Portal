import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function MyRequests() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    if (!user?.user_id) { setErr("Missing user_id from login"); return; }
    setErr(""); setMsg("");
    setLoading(true);
    try {
      const data = await api.getUserRequests(user.user_id);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const onReturn = async (id) => {
    try {
      setBusyId(id);
      await api.returnMyRequest(id);
      setMsg("Item returned");
      await load();
    } catch (e) {
      setMsg(e.message || "Return failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{display:"grid", gap:16}}>
      <h2 style={{margin:0}}>My Requests</h2>

      <div style={{display:"flex", gap:12, alignItems:"center"}}>
        <button onClick={load} style={{border:"1px solid #111", borderRadius:8, padding:"6px 10px"}}>
          Refresh
        </button>
        {loading && <span>Loading…</span>}
        {err && <span style={{color:"#dc2626"}}>{err}</span>}
        {msg && !err && <span style={{color:"#2563eb"}}>{msg}</span>}
      </div>

      <div style={{overflowX:"auto", border:"1px solid #eee", borderRadius:12, background:"#fff"}}>
        <table style={{width:"100%", fontSize:14}}>
          <thead style={{background:"#f8fafc"}}>
            <tr>
              <th style={{textAlign:"left", padding:12}}>#</th>
              <th style={{textAlign:"left", padding:12}}>Equipment</th>
              <th style={{textAlign:"left", padding:12}}>Status</th>
              <th style={{textAlign:"left", padding:12}}>Issued</th>
              <th style={{textAlign:"left", padding:12}}>Returned</th>
              <th style={{textAlign:"left", padding:12}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const canReturn = r.status === "approved";
              return (
                <tr key={r.id} style={{borderTop:"1px solid #eee"}}>
                  <td style={{padding:12}}>{r.id}</td>
                  <td style={{padding:12}}>{r.equipment_name || r.equipment_id}</td>
                  <td style={{padding:12}}>
                    <span style={{border:"1px solid #ddd", borderRadius:999, padding:"2px 8px"}}>{r.status}</span>
                  </td>
                  <td style={{padding:12}}>{r.issue_date ? new Date(r.issue_date).toLocaleString() : "—"}</td>
                  <td style={{padding:12}}>{r.return_date ? new Date(r.return_date).toLocaleString() : "—"}</td>
                  <td style={{padding:12}}>
                    <button
                      disabled={!canReturn || busyId === r.id}
                      onClick={() => onReturn(r.id)}
                      style={{
                        border:"1px solid #111",
                        borderRadius:8,
                        padding:"4px 10px",
                        opacity: (!canReturn || busyId === r.id) ? 0.6 : 1
                      }}
                    >
                      {busyId === r.id ? "Returning..." : "Return"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && !loading && !err && (
              <tr>
                <td colSpan="6" style={{padding:16, opacity:0.7}}>No requests yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
