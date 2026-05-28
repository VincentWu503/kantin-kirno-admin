"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AdminUser } from "@/utils/interfaces";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

type AuthStateData = {
  token: string | null;
  admin: AdminUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
};

const AdminAuthContext = createContext<{
  isLoggedIn: boolean;
  isLoading: boolean;
  admin: AdminUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  getAdminPayload: () => AdminUser | null;
  getAuthState: () => AuthStateData | null;
}>({
  isLoggedIn: false,
  isLoading: true,
  admin: null,
  token: null,
  login: () => {},
  logout: () => {},
  getAdminPayload: () => null,
  getAuthState: () => null,
});

function decodeJwtPayload(token: string): AdminUser | null {
  try {
    const payload = jwtDecode(token) as AdminUser;
    return payload;
  } catch {
    return null;
  }
}

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthStateData>({
    token: null,
    admin: null,
    isLoggedIn: false,
    isLoading: true,
  });

  // Initialize auth from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("admin_token");
    if (stored) {
      const payload = decodeJwtPayload(stored);
      if (payload && payload.admin_id) {
        setAuthState({
          token: stored,
          admin: payload,
          isLoggedIn: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem("admin_token");
        setAuthState({
          token: null,
          admin: null,
          isLoggedIn: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        token: null,
        admin: null,
        isLoggedIn: false,
        isLoading: false,
      });
    }
  }, []);

  const login = (token: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_token", token);
    }

    const newPayload = jwtDecode(token) as AdminUser;
    setAuthState({
      isLoggedIn: true,
      isLoading: false,
      admin: newPayload,
      token: token,
    });
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAuthState({
      isLoggedIn: false,
      isLoading: false,
      admin: null,
      token: null,
    });
  };

  const getAdminPayload = () => {
    return authState.admin || null;
  };

  const getAuthState = () => { return authState || null };
 
  return (
    <AdminAuthContext.Provider
      value={{
        isLoggedIn: authState.isLoggedIn,
        isLoading: authState.isLoading,
        admin: authState.admin,
        token: authState.token,
        logout,
        login,
        getAdminPayload,
        getAuthState
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);