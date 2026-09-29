import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, meRequest, registerRequest } from "./authApi";

const TOKEN_KEY = "auth-token";

const AuthContext = createContext(null);

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage לא זמין – ההתחברות תעבוד עד רענון הדף
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(readToken()));

  // בטעינת האתר – מוודאים מול השרת שה-token השמור עדיין תקף
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    meRequest(token)
      .then((data) => !cancelled && setUser(data.user))
      .catch((err) => {
        if (cancelled) return;
        // מנקים רק אם השרת אמר שה-token לא תקף (ולא בגלל תקלת רשת)
        if (err.status === 401) {
          writeToken(null);
          setToken(null);
        }
        setUser(null);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [token]);

  const saveSession = useCallback((data) => {
    writeToken(data.token);
    setUser(data.user);
    setToken(data.token);
  }, []);

  const login = useCallback(
    async (email, password) => saveSession(await loginRequest(email, password)),
    [saveSession]
  );

  const register = useCallback(
    async (name, email, password) => saveSession(await registerRequest(name, email, password)),
    [saveSession]
  );

  const logout = useCallback(() => {
    writeToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
