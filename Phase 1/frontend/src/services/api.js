const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";
const ADD_EQUIPMENT_PATH = "/equipement"; // backend currently spelled this way

async function jfetch(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok) throw new Error(data?.error || data?.message || res.statusText);
  return data;
}

export const api = {
  login:   (email, password) => jfetch("/login",   { method: "POST", body: { email, password } }),
  signup:  (name, email, password, role="student") =>
           jfetch("/signup",  { method: "POST", body: { name, email, password, role } }),

  getEquipment: () => jfetch("/equipment"),
  addEquipment: (payload) => jfetch(ADD_EQUIPMENT_PATH, { method: "POST", body: payload }),

  borrow:  (user_id, equipment_id) =>
           jfetch("/borrow", { method: "POST", body: { user_id, equipment_id } }),
};
