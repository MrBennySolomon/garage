import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "../data/Login.css";

// שימוש:  <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>טוען...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (adminOnly && user.role !== "admin") {
    return (
      <div className="login-screen" dir="rtl">
        <div className="login-card">
          <h1>אין הרשאה</h1>
          <p>העמוד הזה מיועד למנהלי האתר בלבד.</p>
          <Link to="/">חזרה לעמוד הראשי</Link>
        </div>
      </div>
    );
  }
  return children;
}
