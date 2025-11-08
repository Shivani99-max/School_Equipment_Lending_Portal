import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

function Modal({ open, onClose, children, title = "Dialog" }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: "min(520px, 92vw)", background: "#fff", borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)", overflow: "hidden"
        }}
      >
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid #eee"}}>
          <h3 style={{margin:0, fontWeight:600}}>{title}</h3>
          <button onClick={onClose} style={{border:"none", background:"transparent", fontSize:18, cursor:"pointer"}} aria-label="Close">×</button>
        </div>
        <div style={{padding:16}}>
          {children}
        </div>
      </div>
    </div>
  );
}

const baseInput = {
  padding: "6px 8px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: "14px",
};
const labelLeft = { fontSize: 12, color: "#444", textAlign: "left", width: "80%", marginLeft: 20 };
const inputNarrow = { ...baseInput, width: "80%", marginLeft: 20 };
const selectWider = { ...baseInput, width: "85%", marginLeft: 20 };

function AddEquipmentForm({ onAdded, onClose }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [condition_status, setCondition] = useState("good");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!name || quantity <= 0) { setMsg("Name and quantity are required"); return; }
    try {
      setBusy(true);
      await api.addEquipment({
        name,
        category,
        condition_status,
        quantity,
        available_quantity: quantity,
      });
      onAdded?.();
      onClose?.();
    } catch (err) {
      setMsg(err.message || "Add failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{display:"grid", gap:10}}>
      <label style={labelLeft}>Name</label>
      <input value={name} onChange={e=>setName(e.target.value)} style={inputNarrow} placeholder="Name*" />

      <label style={labelLeft}>Category</label>
      <input value={category} onChange={e=>setCategory(e.target.value)} style={inputNarrow} placeholder="Category" />

      <label style={labelLeft}>Condition</label>
      <select value={condition_status} onChange={e=>setCondition(e.target.value)} style={selectWider}>
        <option value="new">new</option>
        <option value="good">good</option>
        <option value="fair">fair</option>
        <option value="poor">poor</option>
      </select>

      <label style={labelLeft}>Quantity</label>
      <input type="number" min={1} value={quantity} onChange={e=>setQuantity(+e.target.value)} style={inputNarrow} />

      {msg && <div style={{fontSize:13, color:"#dc2626", marginLeft:20}}>{msg}</div>}

      <div style={{display:"flex", gap:10, justifyContent:"flex-end", marginTop:4}}>
        <button type="button" onClick={onClose} style={{border:"1px solid #ddd", borderRadius:8, padding:"8px 10px", background:"#fff"}}>
          Cancel
        </button>
        <button disabled={busy} style={{border:"1px solid #111", borderRadius:8, padding:"8px 10px"}}>
          {busy ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}

function EditEquipmentForm({ initial, onUpdated, onClose }) {
  const [name, setName] = useState(initial.name || "");
  const [category, setCategory] = useState(initial.category || "");
  const [condition_status, setCondition] = useState(initial.condition_status || "good");
  const [quantity, setQuantity] = useState(initial.quantity ?? 1);
  const [available_quantity, setAvail] = useState(initial.available_quantity ?? quantity);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!name || quantity < 0 || available_quantity < 0) { setMsg("Invalid values"); return; }
    if (available_quantity > quantity) { setMsg("Available cannot exceed total quantity"); return; }
    try {
      setBusy(true);
      await api.updateEquipment(initial.id, {
        name, category, condition_status, quantity, available_quantity
      });
      onUpdated?.();
      onClose?.();
    } catch (err) {
      setMsg(err.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{display:"grid", gap:10}}>
      <label style={labelLeft}>Name</label>
      <input value={name} onChange={e=>setName(e.target.value)} style={inputNarrow} />

      <label style={labelLeft}>Category</label>
      <input value={category} onChange={e=>setCategory(e.target.value)} style={inputNarrow} />

      <label style={labelLeft}>Condition</label>
      <select value={condition_status} onChange={e=>setCondition(e.target.value)} style={selectWider}>
        <option value="new">new</option>
        <option value="good">good</option>
        <option value="fair">fair</option>
        <option value="poor">poor</option>
      </select>

      <label style={labelLeft}>Quantity</label>
      <input type="number" min={0} value={quantity} onChange={e=>setQuantity(+e.target.value)} style={inputNarrow} />

      <label style={labelLeft}>Available</label>
      <input type="number" min={0} value={available_quantity} onChange={e=>setAvail(+e.target.value)} style={inputNarrow} />

      {msg && <div style={{fontSize:13, color:"#dc2626", marginLeft:20}}>{msg}</div>}

      <div style={{display:"flex", gap:10, justifyContent:"flex-end", marginTop:4}}>
        <button type="button" onClick={onClose} style={{border:"1px solid #ddd", borderRadius:8, padding:"8px 10px", background:"#fff"}}>
          Cancel
        </button>
        <button disabled={busy} style={{border:"1px solid #111", borderRadius:8, padding:"8px 10px"}}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export default function Equipment() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);
  const isAdmin = user && (user.role === "admin" || user.role === "staff");

  const load = async () => {
    setErr(""); setLoading(true);
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

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setOpenAdd(false); setOpenEdit(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  const onBorrow = async (equipment_id) => {
    setMsg("");
    if (!user?.user_id) { setMsg("Login response missing user_id"); return; }
    try {
      setBusyId(equipment_id);
      await api.borrow(user.user_id, equipment_id);
      setMsg("Request submitted");
      await load();
    } catch (e) {
      setMsg(e.message || "Borrow failed");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteEquipment(row.id);
      setMsg("Deleted");
      await load();
    } catch (e) {
      setMsg(e.message || "Delete failed");
    }
  };

  return (
    <div style={{display:"grid", gap:16}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2 style={{margin:0}}>Equipments</h2>
        {isAdmin && (
          <button onClick={() => setOpenAdd(true)} style={{border:"1px solid #111", borderRadius:8, padding:"8px 12px"}}>
            + Add Equipment
          </button>
        )}
      </div>

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
      {msg && !err && <div style={{color:"#2563eb"}}>{msg}</div>}

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

                <div style={{display:"grid", gap:8}}>
                  <button
                    onClick={() => onBorrow(e.id)}
                    disabled={disabled}
                    style={{
                      width:"100%", border:"1px solid #111", borderRadius:8, padding:"8px 10px",
                      opacity: disabled ? 0.6 : 1
                    }}
                  >
                    {busyId === e.id ? "Requesting…" : (e.available_quantity > 0 ? "Borrow" : "Out of stock")}
                  </button>

                  {isAdmin && (
                    <div style={{display:"flex", gap:8}}>
                      <button
                        onClick={() => { setEditRow(e); setOpenEdit(true); }}
                        style={{flex:1, border:"1px solid #111", borderRadius:8, padding:"6px 10px"}}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(e)}
                        style={{flex:1, border:"1px solid #dc2626", color:"#dc2626", borderRadius:8, padding:"6px 10px", background:"#fff"}}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{opacity:0.7}}>No items match your filters.</div>}
        </div>
      )}

      {/* Add dialog */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Equipment">
        <AddEquipmentForm onAdded={load} onClose={() => setOpenAdd(false)} />
      </Modal>

      {/* Edit dialog */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Edit Equipment">
        {editRow && (
          <EditEquipmentForm
            initial={editRow}
            onUpdated={load}
            onClose={() => setOpenEdit(false)}
          />
        )}
      </Modal>
    </div>
  );
}
