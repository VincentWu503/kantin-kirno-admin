"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AdminUser } from "@/utils/interfaces";
import { jwtDecode } from "jwt-decode";

const AdminAuthContext = createContext<{
  isLoggedIn: boolean;
  isLoading: boolean;
  admin: AdminUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  // setAdminToken: (token: string) => void;
  getAdminPayload: () => void;
  // setAdminPayload: () => void;
}>({
  isLoggedIn: false,
  isLoading: true,
  admin: null,
  token: null,
  login: () => {},
  logout: () => {},
  // setAdminToken: () => {},
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

// INI KELOAD sebelum browser (SSR)
// const initializeAuth = () => {
//   if (typeof window === undefined) return;
//   const stored = localStorage.getItem("admin_token");
//   if (stored) {
//     const payload = decodeJwtPayload(stored);
//     if (payload && payload.admin_id) {
//       return {
//         token: stored,
//         admin: payload as unknown as AdminUser,
//         isLoggedIn: true,
//         isLoading: false,
//       };
//     } else {
//       localStorage.removeItem("admin_token");
//     }
    
//   }

//   return {
//     token: null,
//     admin: null,
//     isLoggedIn: false, // gak dipakai
//     isLoading: false, // gak dipakai
//   };
// };

type AuthStateData = {
  token: string | null,
  admin: AdminUser | null,
  isLoggedIn: boolean,
  isLoading: boolean,
}

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  // nyawit kalian
  // const [authState, setAuthState] = useState(() => {
  //   const authData = initializeAuth();
    
  //   if (authData?.token && authData?.admin) {
  //     return {
  //       token: authData.token,
  //       admin: authData.admin,
  //       isLoggedIn: true,
  //       isLoading: false,
  //     };
  //   } else {
  //     return {
  //       isLoggedIn: false,
  //       isLoading: false,
  //       admin: null as AdminUser | null,
  //       token: null as string | null,
  //     };
  //   }
  // });
  const [authState, setAuthState] = useState<AuthStateData>({
    token: null,
    admin: null,
    isLoggedIn: false,
    isLoading: true,
  });

  useEffect(() => {
    const initialState = initializeAuth() as any;
    if (initialState) setAuthState(initialState);
  }, [])

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAuthState({
      isLoggedIn: false,
      isLoading: true,
      admin: null,
      token: null,
    });
  };

  // kenapa gak namain login?????????????????????????????????????????????????????????
  // nasib beda repo, beda implementasi, lu pada nyusahin tim lain yang ngerjain
  const login = (token: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_token", token);
    }

    const newPayload = jwtDecode(token) as AdminUser;
    setAuthState({
      isLoggedIn: true,
      isLoading: false,
      admin: authState?.admin || newPayload,
      token: authState?.token || token,
    });
  };

  const getAdminPayload = () => {
    if (authState?.token && authState.admin !== null) return authState.admin;
    return null;
  }

  const initializeAuth = async () => {
    if (typeof window === undefined) return;
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
      isLoggedIn: false, // gak dipakai
      isLoading: false, // gak dipakai
    };
  };

  return (
    <AdminAuthContext.Provider value={{ 
      isLoggedIn: authState?.isLoggedIn || false, 
      isLoading: authState?.isLoading || false, 
      admin: authState?.admin || null, 
      token: authState?.token || "", 
      logout, 
      login, 
      getAdminPayload 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);