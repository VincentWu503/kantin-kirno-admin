"use client";

import { createContext, useContext, useState } from "react";

interface AdminUser {
  admin_id: string;
  username: string;
  email: string;
  super_admin: boolean;
  verified: boolean;
}

const AdminAuthContext = createContext<{
  isLoggedIn: boolean;
  isLoading: boolean;
  admin: AdminUser | null;
  token: string | null;
  logout: () => void;
  setAdminToken: (token: string) => void;
}>({
  isLoggedIn: false,
  isLoading: true,
  admin: null,
  token: null,
  logout: () => {},
  setAdminToken: () => {},
});

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const initializeAuth = () => {
  const stored = localStorage.getItem("admin_token");
  if (stored) {
    const payload = decodeJwtPayload(stored);
    if (payload && payload.admin_id) {
      return {
        token: stored,
        admin: payload as unknown as AdminUser,
        isLoggedIn: true,
        isLoading: false,
      };
    } else {
      localStorage.removeItem("admin_token");
    }
  }
  return {
    token: null,
    admin: null,
    isLoggedIn: false,
    isLoading: false,
  };
};

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState] = useState(() => initializeAuth());
  const [isLoggedIn, setIsLoggedIn] = useState(authState.isLoggedIn);
  const [isLoading] = useState(authState.isLoading);
  const [admin, setAdmin] = useState<AdminUser | null>(authState.admin);
  const [token, setToken] = useState<string | null>(authState.token);

  const setAdminToken = (t: string) => {
    localStorage.setItem("admin_token", t);
    const payload = decodeJwtPayload(t);
    if (payload && payload.admin_id) {
      setToken(t);
      setAdmin(payload as unknown as AdminUser);
      setIsLoggedIn(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
    setAdmin(null);
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, isLoading, admin, token, logout, setAdminToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);