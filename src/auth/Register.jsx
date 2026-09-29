import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "./AuthContext";
import "../data/Login.css";
import "./Auth.css";

const MIN_PASSWORD = 8;

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD) {
      return setError(`הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD} תווים`);
    }
    if (password !== confirm) {
      return setError("הסיסמאות אינן תואמות");
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email, password);
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
          <UserPlus size={20} />
        </div>

        <h1>הרשמה</h1>
        <p>יצירת חשבון חדש</p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם מלא"
          autoComplete="name"
          required
          autoFocus
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="אימייל"
          autoComplete="email"
          dir="ltr"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={`סיסמה (לפחות ${MIN_PASSWORD} תווים)`}
          autoComplete="new-password"
          required
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="אימות סיסמה"
          autoComplete="new-password"
          required
        />

        {error && <div className="login-error">{error}</div>}

        <button className="btn-primary1" type="submit" disabled={submitting}>
          {submitting ? "יוצר חשבון..." : "הרשמה"}
        </button>

        <div className="auth-switch">
          כבר יש לכם חשבון? <Link to="/login" state={location.state}>התחברות</Link>
        </div>
      </form>
    </div>
  );
}
