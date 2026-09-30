// src/pages/Login.jsx
// דף הרשמה / התחברות / התנתקות – מוצג בנתיב /login

import React, { useState, useEffect } from "react";

// const API = "http://localhost:4000/api";
const API = "https://users-server-seven.vercel.app/api";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2f1",
    fontFamily: "system-ui, 'Segoe UI', Arial, sans-serif",
    direction: "rtl",
    padding: 16,
    boxSizing: "border-box"
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    borderRadius: 12,
    padding: 28,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
  },
  title: { margin: "0 0 20px", fontSize: 24, color: "#14332d" },
  field: { display: "block", marginBottom: 14, fontSize: 14, color: "#33443f" },
  input: {
    display: "block",
    width: "100%",
    marginTop: 6,
    padding: "10px 12px",
    border: "1px solid #c5d0cc",
    borderRadius: 8,
    fontSize: 15,
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    padding: "11px 0",
    border: "none",
    borderRadius: 8,
    background: "#f04a32",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer"
  },
  link: {
    background: "none",
    border: "none",
    color: "#1f6f5c",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    textDecoration: "underline"
  },
  error: {
    background: "#fdecea",
    color: "#a12a1f",
    padding: "8px 12px",
    borderRadius: 8,
    marginBottom: 14,
    fontSize: 14
  },
  switchRow: {
    marginTop: 18,
    fontSize: 14,
    textAlign: "center",
    color: "#33443f"
  }
};

/* ---------- טופס הרשמה / התחברות ---------- */
function AuthForm({ mode, onSuccess, onSwitch }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "אירעה שגיאה");
      onSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => e.key === "Enter" && submit();

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>{isRegister ? "יצירת חשבון" : "התחברות"}</h1>

      {error && <div style={styles.error}>{error}</div>}

      {isRegister && (
        <label style={styles.field}>
          שם
          <input style={styles.input} name="name" value={form.name} onChange={update} onKeyDown={onKeyDown} />
        </label>
      )}
      <label style={styles.field}>
        אימייל
        <input style={styles.input} type="email" name="email" value={form.email} onChange={update} onKeyDown={onKeyDown} />
      </label>
      <label style={styles.field}>
        סיסמה
        <input style={styles.input} type="password" name="password" value={form.password} onChange={update} onKeyDown={onKeyDown} />
      </label>

      <button style={styles.button} onClick={submit} disabled={loading}>
        {loading ? "רגע..." : isRegister ? "הרשמה" : "כניסה"}
      </button>

      <div style={styles.switchRow}>
        {isRegister ? "כבר יש לך חשבון? " : "אין לך חשבון? "}
        <button style={styles.link} onClick={onSwitch}>
          {isRegister ? "להתחברות" : "להרשמה"}
        </button>
      </div>
    </div>
  );
}

/* ---------- אזור מחובר ---------- */
function Dashboard({ user, onLogout }) {
  return (
    <div style={styles.card}>
      <h1 style={styles.title}>שלום, {user.name}</h1>
      <p style={{ color: "#33443f", marginTop: 0 }}>
        אתה מחובר עם האימייל <strong>{user.email}</strong>
      </p>
      <button style={styles.button} onClick={onLogout}>
        התנתקות
      </button>

    </div>
  );
}

/* ---------- דף /login ---------- */
export default function Login() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [checking, setChecking] = useState(!!localStorage.getItem("token"));

  // בטעינה ראשונית: אם יש טוקן שמור, מוודאים אותו מול השרת
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, [token]);

  const handleAuth = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // גם אם השרת לא זמין, מנקים את הטוקן מקומית
    }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setMode("login");
  };

  if (checking) {
    return <div style={styles.page}>טוען...</div>;
  }

  return (
    <div style={styles.page}>
      {token && user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthForm
          key={mode}
          mode={mode}
          onSuccess={handleAuth}
          onSwitch={() => setMode(mode === "login" ? "register" : "login")}
        />
      )}
    </div>
  );
}
