import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "./AuthContext";
import "../data/Login.css";
import "./Auth.css";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen" dir="rtl">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">
          <LogIn size={20} />
        </div>

        <h1>התחברות</h1>
        <p>הזינו אימייל וסיסמה</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="אימייל"
          autoComplete="email"
          dir="ltr"
          required
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="סיסמה"
          autoComplete="current-password"
          required
        />

        {error && <div className="login-error">{error}</div>}

        <button className="btn-primary1" type="submit" disabled={submitting}>
          {submitting ? "מתחבר..." : "כניסה"}
        </button>

        <div className="auth-switch">
          אין לכם חשבון? <Link to="/register" state={location.state}>הרשמה</Link>
        </div>
      </form>
    </div>
  );
}
