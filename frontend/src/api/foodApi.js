const API_BASE = "http://localhost:3000/api";

export async function getFoods() {
  const res = await fetch(`${API_BASE}/food/list`, {
    credentials: "include",
  });
  return res.json();
}