import React, { useEffect, useMemo, useState } from "react";
import { Download, Lock, Phone, RefreshCw, Search, X } from "lucide-react";
import "../data/Login.css";

const API_URL = "https://6aae754a606bd915d110d395.mockapi.io/api/clients";

// סיסמת הכניסה למסך הניהול – מומלץ להחליף לפני שימוש בפועל
const ADMIN_PASSWORD = "";
const SESSION_KEY = "admin-authed";

// כל קטגוריה מקבלת צבע משלה – זהה בטבלה ובכרטיסים
const CATEGORY_COLORS = {
  "טיפול תקופתי": "#1d9a6c",
  דיאגנוסטיקה: "#2f6fd0",
  מיזוג: "#0f9bb0",
  "חשמל רכב": "#b8860b",
  מכונאות: "#7a5af5",
  "הכנה לטסט": "#d2691e",
  "תיקון רכב שנכשל בטסט": "#d33a45"
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

function colorOf(category) {
  return CATEGORY_COLORS[category] || "#6b7280";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  function handleLogin(e) {
    e.preventDefault();

    if (password === ADMIN_PASSWORD && localStorage.getItem("token")) {
      setAuthError("");
      setAuthed(true);

      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // sessionStorage לא זמין – ההתחברות עדיין תעבוד לטאב הנוכחי
      }
    } else {
      setAuthError("התחבר ואז נסה שוב");
    }
  }

  function logout() {
    setAuthed(false);
    setPassword("");

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();

      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("לא הצלחנו לטעון את הפניות. בדקו את החיבור ונסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function remove(id) {
    if (!window.confirm("למחוק את הבקשה? הפעולה אינה הפיכה.")) return;

    setDeletingId(id);

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      console.error(err);
      setError("מחיקת הבקשה נכשלה. נסו שוב.");
    } finally {
      setDeletingId(null);
    }
  }

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();

    return rows
      .filter((row) => (category === "all" ? true : row.category === category))
      .filter((row) => {
        if (!text) return true;

        return [row.name, row.phone, row.details]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(text));
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [rows, query, category]);

  const counts = useMemo(() => {
    return rows.reduce((acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    }, {});
  }, [rows]);

  function exportCsv() {
    const header = ["שם", "טלפון", "קטגוריה", "פרטים", "תאריך"];

    const lines = visible.map((row) =>
      [
        row.name,
        row.phone,
        row.category,
        row.details,
        formatDate(row.createdAt)
      ]
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    // BOM כדי שאקסל יציג עברית כמו שצריך
    const blob = new Blob(
      ["\uFEFF" + [header.join(","), ...lines].join("\n")],
      {
        type: "text/csv;charset=utf-8;"
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `hovalot-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  if (!authed) {
    return (
      <div className="admin login-screen" dir="rtl">
        <style>{css}</style>

        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-icon">
            <Lock size={20} />
          </div>

          <h3>כניסה לניהול פניות</h3>

          {/* <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            autoFocus
          /> */}

          {authError && <div className="login-error">{authError}</div>}

          <button className="btn-primary1" type="submit">
            כניסה
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin" dir="rtl">
      <style>{css}</style>

      <header className="admin-head">
        <div>
          <h1>בקשות הצעת מחיר</h1>
          <p>
            {rows.length} פניות במערכת · {visible.length} מוצגות כעת
          </p>
        </div>

        <div className="admin-actions">
          <button className="ghost" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            רענון
          </button>

          <button
            className="ghost"
            onClick={exportCsv}
            disabled={!visible.length}
          >
            <Download size={16} />
            ייצוא CSV
          </button>

          <button className="ghost" onClick={logout}>
            יציאה
          </button>
        </div>
      </header>

      <div className="admin-tools">
        <label className="search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי שם, טלפון או תיאור"
          />
        </label>

        <div className="chips">
          <button
            className={category === "all" ? "chip on" : "chip"}
            onClick={() => setCategory("all")}
            style={{ "--c": "#334155" }}
          >
            הכל ({rows.length})
          </button>

          {CATEGORIES.map((name) => (
            <button
              key={name}
              className={category === name ? "chip on" : "chip"}
              onClick={() => setCategory(name)}
              style={{ "--c": colorOf(name) }}
            >
              {name} ({counts[name] || 0})
            </button>
          ))}
        </div>
      </div>

      {error && <div className="state error">{error}</div>}

      {loading && <div className="state">טוען פניות…</div>}

      {!loading && !visible.length && !error && (
        <div className="state">
          אין פניות להצגה. שנו את החיפוש או הסינון כדי לראות פניות אחרות.
        </div>
      )}

      {!loading && visible.length > 0 && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>קטגוריה</th>
                  <th>פרטי הפנייה</th>
                  <th>תאריך</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {visible.map((row) => (
                  <tr key={row.id} style={{ "--c": colorOf(row.category) }}>
                    <td className="strong">{row.name || "—"}</td>

                    <td>
                      <a href={`tel:${row.phone}`} className="tel">
                        {row.phone || "—"}
                      </a>
                    </td>

                    <td>
                      <span className="tag">
                        {row.category || "ללא קטגוריה"}
                      </span>
                    </td>

                    <td className="details">{row.details || "—"}</td>

                    <td className="muted">{formatDate(row.createdAt)}</td>

                    <td>
                      <button
                        className="icon danger"
                        onClick={() => remove(row.id)}
                        disabled={deletingId === row.id}
                        aria-label="מחיקת פנייה"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cards">
            {visible.map((row) => (
              <article
                key={row.id}
                className="card"
                style={{ "--c": colorOf(row.category) }}
              >
                <div className="card-top">
                  <b>{row.name || "—"}</b>
                  <span className="tag">{row.category || "ללא קטגוריה"}</span>
                </div>

                {row.details && <p>{row.details}</p>}

                <div className="card-foot">
                  <a href={`tel:${row.phone}`} className="tel">
                    <Phone size={15} />
                    {row.phone || "—"}
                  </a>

                  <span className="muted">{formatDate(row.createdAt)}</span>

                  <button
                    className="icon danger"
                    onClick={() => remove(row.id)}
                    disabled={deletingId === row.id}
                    aria-label="מחיקת פנייה"
                  >
                    <X size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const css = `
.admin {
  --bg: #f5f6f8;
  --panel: #ffffff;
  --ink: #16202c;
  --muted: #64748b;
  --line: #e3e7ed;
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 18px 60px;
  color: var(--ink);
  font-family: inherit;
  background: var(--bg);
  min-height: 100vh;
}
.admin h1 { margin: 0 0 4px; font-size: 1.8rem; letter-spacing: -0.02em; }
.admin p { margin: 0; color: var(--muted); font-size: .92rem; }

.admin-head {
  display: flex; flex-wrap: wrap; gap: 14px;
  align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.admin-actions { display: flex; gap: 8px; }

.admin button { font: inherit; cursor: pointer; border-radius: 10px; }
.admin button:disabled { opacity: .5; cursor: not-allowed; }
.admin button:focus-visible { outline: 2px solid #2f6fd0; outline-offset: 2px; }

.ghost {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 14px; background: var(--panel);
  border: 1px solid var(--line); color: var(--ink);
}
.ghost:hover:not(:disabled) { border-color: #c3ccd8; }

.admin-tools { display: grid; gap: 12px; margin-bottom: 18px; }

.search {
  display: flex; align-items: center; gap: 9px;
  background: var(--panel); border: 1px solid var(--line);
  border-radius: 12px; padding: 0 13px; color: var(--muted);
}
.search input {
  font: inherit; border: 0; outline: 0; background: transparent;
  padding: 12px 0; width: 100%; color: var(--ink);
}

.chips { display: flex; flex-wrap: wrap; gap: 7px; }
.chip {
  padding: 6px 12px; font-size: .85rem;
  background: var(--panel); color: var(--c);
  border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
}
.chip.on { background: var(--c); color: #fff; border-color: var(--c); }

.state {
  background: var(--panel); border: 1px solid var(--line);
  border-radius: 12px; padding: 28px; text-align: center; color: var(--muted);
}
.state.error { color: #b3202c; border-color: #f0c2c6; background: #fdf2f3; }

.table-wrap {
  background: var(--panel); border: 1px solid var(--line);
  border-radius: 14px; overflow: hidden;
}
.admin table { width: 100%; border-collapse: collapse; }
.admin thead th {
  text-align: right; font-size: .8rem; font-weight: 600;
  color: var(--muted); padding: 12px 14px;
  background: #eef1f5; border-bottom: 1px solid var(--line);
}
.admin tbody tr { border-bottom: 1px solid var(--line); }
.admin tbody tr:last-child { border-bottom: 0; }
.admin tbody tr:hover { background: color-mix(in srgb, var(--c) 6%, transparent); }
.admin td {
  padding: 13px 14px; font-size: .92rem; vertical-align: top;
  border-right: 4px solid transparent;
}
.admin td:first-child { border-right-color: var(--c); }
.strong { font-weight: 600; }
.muted { color: var(--muted); white-space: nowrap; font-size: .86rem; }
.details { max-width: 380px; line-height: 1.55; color: #33414f; }

.tag {
  display: inline-block; padding: 4px 10px; border-radius: 999px;
  font-size: .8rem; color: var(--c); white-space: nowrap;
  background: color-mix(in srgb, var(--c) 12%, transparent);
}
.tel { color: #1f4f9c; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; }
.tel:hover { text-decoration: underline; }

.icon {
  display: inline-grid; place-items: center; width: 30px; height: 30px;
  background: transparent; border: 1px solid var(--line); color: var(--muted);
  border-radius: 50%;
}
.icon.danger:hover:not(:disabled) { color: #c0202e; border-color: #f0c2c6; background: #fdf2f3; }

.cards { display: none; gap: 12px; }
.card {
  background: var(--panel); border: 1px solid var(--line);
  border-right: 5px solid var(--c); border-radius: 12px; padding: 14px;
}
.card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.card p { margin: 9px 0 12px; color: #33414f; line-height: 1.55; font-size: .92rem; }
.card-foot { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.card-foot .icon { margin-inline-start: auto; }

.spin { animation: admin-spin 1s linear infinite; }
@keyframes admin-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }

/* עיצוב מסך הכניסה (login-screen / login-card וכו') עבר לקובץ Login.css המשותף */

/* טאבלט */
@media (max-width: 1024px) {
  .details { max-width: 240px; }
  .admin td, .admin thead th { padding: 11px 10px; font-size: .88rem; }
}

/* מובייל – מעבר מטבלה לכרטיסים */
@media (max-width: 760px) {
  .admin { padding: 18px 12px 48px; }
  .admin h1 { font-size: 1.45rem; }
  .table-wrap { display: none; }
  .cards { display: grid; }
  .admin-head { align-items: flex-start; }
  .admin-actions { width: 100%; }
  .ghost { flex: 1; justify-content: center; }
  .chips { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; }
  .chip { white-space: nowrap; }
}
`;
