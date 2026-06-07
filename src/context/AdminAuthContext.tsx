"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AdminUser } from "@/utils/interfaces";
import { jwtDecode } from "jwt-decode";
import { handleLogoutApi } from "@/lib/admins";
import { useRouter } from "next/navigation";

type AuthStateData = {
  admin: AdminUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
};

const AdminAuthContext = createContext<{
  isLoggedIn: boolean;
  isLoading: boolean;
  admin: AdminUser | null;
  login: (token: string) => void;
  logout: () => void;
  getAdminPayload: () => AdminUser | null;
  getAuthState: () => AuthStateData | null;
}>({
  isLoggedIn: false,
  isLoading: true,
  admin: null,
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

export const AdminAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [authState, setAuthState] = useState<AuthStateData>({
    admin: null,
    isLoggedIn: false,
    isLoading: true,
  });

  const router = useRouter();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("admin_token");
    if (stored) {
      const payload = decodeJwtPayload(stored);
      if (payload && payload.admin_id) {
        setAuthState({
          admin: payload,
          isLoggedIn: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem("admin_token");
        setAuthState({
          admin: null,
          isLoggedIn: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
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
    });
  };

  // client side and api logout handling
  const logout = async () => {
    const token = localStorage.getItem("admin_token") || "";
    await handleLogoutApi(token);
    localStorage.removeItem("admin_token");
    setAuthState({
      isLoggedIn: false,
      isLoading: false,
      admin: null,
    });

    router.replace("/admin/login");
  };

  const getAdminPayload = () => {
    return authState.admin || null;
  };

  const getAuthState = () => {
    return authState || null;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isLoggedIn: authState.isLoggedIn,
        isLoading: authState.isLoading,
        admin: authState.admin,
        logout,
        login,
        getAdminPayload,
        getAuthState,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
