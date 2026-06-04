"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminGuard from "@/components/AdminGuard";

// Bottom Navigation

function BottomNav() {
  const router = useRouter();

  const items = [
    {
      label: "Order",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      ),
      onClick: () => router.push("/order"),
      active: false,
    },
    {
      label: "Edit",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      onClick: () => router.push("/admin/menu"),
      active: false
    },
    {
      label: "Close",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
      ),
      onClick: () => router.push("/admin/status"),
      active: false
    },
    {
      label: "Account",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      onClick: () => router.push("/account"),
      active: true,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-500 flex items-center justify-around py-3 px-2 z-40">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className={`flex flex-col items-center gap-1 px-3 ${item.active ? "opacity-100" : "opacity-70 hover:opacity-100"} transition`}
        >
          <span className="text-white">{item.icon}</span>
          <span className="text-white text-[10px] font-medium">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Main Content

function AccountContent() {
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const displayName = admin?.email || "Admin";

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Body */}
      <div className="flex flex-col items-center px-6 gap-6">
        {/* Logo */}
        <div className="w-40 h-40 rounded-full mt-6 md:mt-9 border-4 border-red-400 flex items-center justify-center bg-yellow-400 overflow-hidden">
          <span className="text-[11px] font-extrabold text-black text-center leading-tight px-2">
            SAHERA PAK KIRNO
          </span>
        </div>

        {/* Nama admin */}
        <h1 className="text-xl md:text-2xl font-bold text-black">
          {displayName}
        </h1>

        {/* Tombol-tombol */}
        <div className="w-50 flex flex-col gap-3 mt-2">
          {/* Kelola Admin — hanya muncul untuk super_admin */}
          {admin?.super_admin && (
            <button
              onClick={() => router.push("/account/kelola")}
              className="py-4 bg-gray-200 hover:bg-gray-300 text-black text-lg rounded-full transition active:scale-95"
            >
              Kelola Admin
            </button>
          )}

          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="py-4 bg-gray-200 hover:bg-gray-300 text-red-500 text-lg rounded-full transition active:scale-95"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}

export default function AdminAccountPage() {
  return (
    <AdminGuard>
      <AccountContent />
    </AdminGuard>
  );
}
