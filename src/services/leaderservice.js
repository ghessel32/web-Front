const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchLeaderboard(page = 1, limit = 20) {
  const res = await fetch(
    `${API_BASE}/leaderboard?page=${page}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function fetchTopWebsites() {
  const res = await fetch(`${API_BASE}/top-websites`);
  if (!res.ok) throw new Error("Failed to fetch top websites");
  return res.json();
}
