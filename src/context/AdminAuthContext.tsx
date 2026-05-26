"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AdminUser } from "@/utils/interfaces";

const AdminAuthContext = createContext<{
  isLoggedIn: boolean;
  isLoading: boolean;
  admin: AdminUser | null;
  token: string | null;
  logout: () => void;
  setAdminToken: (token: string) => void;
  getAdminPayload: () => void;
  // setAdminPayload: () => void;
}>({
  isLoggedIn: false,
  isLoading: true,
  admin: null,
  token: null,
  logout: () => {},
  setAdminToken: () => {},
  getAdminPayload: () => {},
  // setAdminPayload: () => {},
});

function decodeJwtPayload(token: string): AdminUser | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as AdminUser;
  } catch {
    return null;
  }
}

const initializeAuth = () => {
  if (typeof window !== undefined) {
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
  }

  return {
    token: null,
    admin: null,
    isLoggedIn: false, // gak dipakai
    isLoading: false, // gak dipakai
  };
};

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState(() => {
    const authData = initializeAuth();
    
    if (authData.token && authData.admin) {
      return {
        token: authData.token,
        admin: authData.admin,
        isLoggedIn: true,
        isLoading: false,
      };
    } else {
      return {
        isLoggedIn: false,
        isLoading: false,
        admin: null as AdminUser | null,
        token: null as string | null,
      };
    }
  });

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAuthState({
      isLoggedIn: false,
      isLoading: false,
      admin: null,
      token: null,
    });
  };

  const setAdminToken = (t: string) => {
    localStorage.setItem("admin_token", t);
    const payload = decodeJwtPayload(t);
    if (payload && payload.admin_id) {
      setAuthState({
        token: t,
        admin: payload as unknown as AdminUser,
        isLoggedIn: true,
        isLoading: false,
      });
    }
  };

  const getAdminPayload = () => {
    if (authState.token && authState.admin !== null) return authState.admin;
    return null;
  }

  return (
    <AdminAuthContext.Provider value={{ 
      isLoggedIn: authState.isLoggedIn, 
      isLoading: authState.isLoading, 
      admin: authState.admin, 
      token: authState.token, 
      logout, 
      setAdminToken, 
      getAdminPayload 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);