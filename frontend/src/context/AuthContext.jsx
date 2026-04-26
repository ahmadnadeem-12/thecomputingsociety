
import React, { createContext, useEffect, useMemo, useState } from "react";
import { getSessionUser, loginUser, logoutUser, registerUser } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionUser = await getSessionUser();
        setUser(sessionUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthed: !!user,
    isAdmin: user?.role === "admin",
    login: async (payload) => {
      const { user: u } = await loginUser(payload);
      setUser(u);
      return u;
    },
    register: async (payload) => {
      const u = await registerUser(payload);
      setUser(u);
      return u;
    },
    logout: () => {
      logoutUser();
      setUser(null);
    },
    refreshUser: async () => {
      try {
        const sessionUser = await getSessionUser();
        setUser(sessionUser);
        return sessionUser;
      } catch (err) {
        console.error("Refresh user failed", err);
      }
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
