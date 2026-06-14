"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminGuard from "@/components/AdminGuard";
import Image from "next/image";

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
        <div className="w-50 h-50 rounded-full mt-6 md:mt-9 flex items-center justify-center bg-white overflow-hidden">
          {/*<span className="text-[11px] font-extrabold text-black text-center leading-tight px-2">
            SAHERA PAK KIRNO
          </span>*/}
          <Image
            src="/kirno_logo_name.png"
            alt="Logo"
            width={512}
            height={512}
          />
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
