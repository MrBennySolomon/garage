// כתובת השרת. אפשר להגדיר ב-.env של Vite:  VITE_API_URL=https://...
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://business-server-git-main-mrbennysolomons-projects.vercel.app"
).replace(/\/$/, "");

async function request(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error("אין חיבור לשרת. נסו שוב מאוחר יותר.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || "אירעה שגיאה. נסו שוב.");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const registerRequest = (name, email, password) =>
  request("/api/auth/register", { method: "POST", body: { name, email, password } });

export const loginRequest = (email, password) =>
  request("/api/auth/login", { method: "POST", body: { email, password } });

export const meRequest = (token) => request("/api/auth/me", { token });
