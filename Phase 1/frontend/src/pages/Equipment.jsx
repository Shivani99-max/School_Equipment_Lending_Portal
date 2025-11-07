import React, { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";

export default function Equipment() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  // read logged-in user (saved at login)
  const user = React.useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const data = await api.getEquipment();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(items.map(i => i.category || "Uncategorized")))],
    [items]
  );

  const filtered = items.filter(i => {
    const hay = `${i.name} ${i.category} ${i.condition_status}`.toLowerCase();
    const okQ = hay.includes(q.toLowerCase());
    const okC = cat === "all" || (i.category || "Uncategorized") === cat;
    return okQ && okC;
  });

  // ⬇️ Borrow handler
  const onBorrow = async (equipment_id) => {
    setMsg("");
    if (!user?.user_id) {
      setMsg("Login response missing user_id. Please make /login return user_id.");
      return;
    }
    try {
      setBusyId(equipment_id);
      await api.borrow(user.user_id, equipment_id);
      setMsg("Request submitted");
      await load(); // refresh availability counts
    } catch (e) {
      setMsg(e.message || "Borrow failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{display:"grid", gap:16}}>
      <h2 style={{margin:0}}>Equipment</h2>

      <div style={{display:"flex", gap:12}}>
        <input
          placeholder="Search equipment..."
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          style={{flex:1, border:"1px solid #ddd", borderRadius:8, padding:"8px 10px"}}
        />
        <select
          value={cat}
          onChange={(e)=>setCat(e.target.value)}
          style={{border:"1px solid #ddd", borderRadius:8, padding:"8px 10px"}}
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={load} style={{border:"1px solid #111", borderRadius:8, padding:"8px 10px"}}>Refresh</button>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div style={{color:"#dc2626"}}>{err}</div>}
      {msg && <div style={{color:"#2563eb"}}>{msg}</div>}

      {!loading && !err && (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:16}}>
          {filtered.map(e => {
            const disabled = e.available_quantity <= 0 || busyId === e.id;
            return (
              <div key={e.id} style={{border:"1px solid #eee", borderRadius:12, padding:16, background:"#fff"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <h3 style={{margin:0, fontWeight:600}}>{e.name}</h3>
                  <span style={{fontSize:12, border:"1px solid #ddd", borderRadius:999, padding:"2px 8px"}}>
                    {e.category || "Uncategorized"}
                  </span>
                </div>
                <p style={{margin:"6px 0", opacity:0.7}}>Condition: {e.condition_status}</p>
                <p style={{margin:"6px 0"}}>
                  Available: <b style={{color:e.available_quantity>0?"#16a34a":"#dc2626"}}>{e.available_quantity}</b> / {e.quantity}
                </p>

                <button
                  onClick={() => onBorrow(e.id)}
                  disabled={disabled}
                  style={{
                    width:"100%",
                    marginTop:8,
                    border:"1px solid #111",
                    borderRadius:8,
                    padding:"8px 10px",
                    opacity: disabled ? 0.6 : 1
                  }}
                >
                  {busyId === e.id ? "Requesting…" : (e.available_quantity > 0 ? "Borrow" : "Out of stock")}
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{opacity:0.7}}>No items match your filters.</div>}
        </div>
      )}
    </div>
  );
}
