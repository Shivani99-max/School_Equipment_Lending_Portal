import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export default function Admin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await api.getAllRequests(); // expects array with { id, user_name/user_id, equipment_name/equipment_id, status, issue_date, return_date }
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onApprove = async (id) => {
    setBusyId(id);
    try { await api.approveRequest(id); setMsg("Approved"); await load(); }
    catch (e) { setErr(e.message || "Approve failed"); }
    finally { setBusyId(null); }
  };

  const onReject = async (id) => {
    setBusyId(id);
    try { await api.rejectRequest(id); setMsg("Rejected"); await load(); }
    catch (e) { setErr(e.message || "Reject failed"); }
    finally { setBusyId(null); }
  };

  // quick stats
  const counts = useMemo(
    () => rows.reduce((m, r) => (m[r.status] = (m[r.status] || 0) + 1, m), {}),
    [rows]
  );

  // small helper for status badge color
  const badgeStyle = (status) => {
    const base = { border: "1px solid #ddd", borderRadius: 999, padding: "2px 8px" };
    const color = {
      pending:  { background: "#fffbeb", borderColor: "#f59e0b" },
      approved: { background: "#ecfdf5", borderColor: "#10b981" },
      rejected: { background: "#fef2f2", borderColor: "#ef4444" },
      returned: { background: "#eef2ff", borderColor: "#6366f1" },
    }[status] || {};
    return { ...base, ...color };
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Admin – Requests</h2>
        <button onClick={load} style={{ border: "1px solid #111", borderRadius: 8, padding: "6px 10px" }}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* divider line */}
      <div style={{ height: 1, background: "#eee", marginBottom: 12 }} />

      <div style={{ fontSize: 13, opacity: 0.8 }}>
        Totals: pending {counts.pending || 0} · approved {counts.approved || 0} · rejected {counts.rejected || 0} · returned {counts.returned || 0}
      </div>

      {err && <div style={{ color: "#dc2626" }}>{err}</div>}
      {msg && !err && <div style={{ color: "#2563eb" }}>{msg}</div>}

      <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 12, background: "#fff" }}>
        <table style={{ width: "100%", fontSize: 14 }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 12 }}>#</th>
              <th style={{ textAlign: "left", padding: 12 }}>User</th>
              <th style={{ textAlign: "left", padding: 12 }}>Equipment</th>
              <th style={{ textAlign: "left", padding: 12 }}>Status</th>
              <th style={{ textAlign: "left", padding: 12 }}>Issued</th>
              <th style={{ textAlign: "left", padding: 12 }}>Returned</th>
              <th style={{ textAlign: "left", padding: 12 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const canApprove = r.status === "pending";
              const canReject = r.status === "pending";
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 12 }}>{r.id}</td>
                  <td style={{ padding: 12 }}>{r.user_name || r.user_id}</td>
                  <td style={{ padding: 12 }}>{r.equipment_name || r.equipment_id}</td>
                  <td style={{ padding: 12 }}>
                    <span style={badgeStyle(r.status)}>{r.status}</span>
                  </td>
                  <td style={{ padding: 12 }}>
                    {r.issue_date ? new Date(r.issue_date).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: 12 }}>
                    {r.return_date ? new Date(r.return_date).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: 12, display: "flex", gap: 8 }}>
                    <button
                      disabled={!canApprove || busyId === r.id}
                      onClick={() => onApprove(r.id)}
                      style={{
                        border: "1px solid #111",
                        borderRadius: 8,
                        padding: "4px 10px",
                        opacity: (!canApprove || busyId === r.id) ? 0.6 : 1,
                      }}
                    >
                      {busyId === r.id ? "..." : "Approve"}
                    </button>
                    <button
                      disabled={!canReject || busyId === r.id}
                      onClick={() => onReject(r.id)}
                      style={{
                        border: "1px solid #111",
                        borderRadius: 8,
                        padding: "4px 10px",
                        opacity: (!canReject || busyId === r.id) ? 0.6 : 1,
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && !loading && !err && (
              <tr>
                <td colSpan="7" style={{ padding: 16, opacity: 0.7 }}>No requests yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
