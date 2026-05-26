"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminGuard from "@/components/AdminGuard";

const API_BASE = "http://localhost:5000";

// Bottom Navigation 

function BottomNav() {
  const router = useRouter();

  const items = [
    {
      label: "Order",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      ),
      onClick: () => router.push("/admin/orders"),
    },
    {
      label: "Edit",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      onClick: () => router.push("/admin/menu"),
    },
    {
      label: "Close",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
          <path d="M12 2a10 10 0 0 1 0 20A10 10 0 0 1 12 2" />
          <path d="M12 6v6" />
        </svg>
      ),
      onClick: () => {},
      active: true,
    },
    {
      label: "Account",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      onClick: () => router.push("/admin/account"),
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
          <span className="text-white text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// Confirmation Modal 

function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  loading,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
      <div className="bg-white rounded-2xl w-full max-w-xs p-6 text-center shadow-2xl space-y-6 border border-gray-200">
        <p className="text-black text-lg font-medium leading-snug">
          Apakah Anda Yakin ingin{" "}
          <span className="font-semibold">
            {isOpen ? "buka" : "menutup"} warung
          </span>{" "}
          Anda?
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold transition active:scale-95 disabled:opacity-50"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "..." : "Ya"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Toggle Component 

function StatusToggle({
  isOpen,
  onToggleRequest,
}: {
  isOpen: boolean;
  onToggleRequest: () => void;
}) {
  return (
    <button
      onClick={onToggleRequest}
      className={`
        relative w-52 h-14 rounded-full flex items-center transition-all duration-300 focus:outline-none
        ${isOpen
          ? "bg-green-500 justify-end pr-1"
          : "bg-white border-2 border-red-400 justify-start pl-1"
        }
      `}
      aria-label={isOpen ? "Tutup toko" : "Buka toko"}
    >
      {/* Label teks */}
      <span
        className={`
          absolute text-sm font-bold tracking-widest select-none transition-all duration-300
          ${isOpen
            ? "left-5 text-white"
            : "right-5 text-black"
          }
        `}
      >
        {isOpen ? "ON" : "TUTUP"}
      </span>

      {/* Knob */}
      <span
        className={`
          w-11 h-11 rounded-full shadow-md flex-shrink-0 transition-all duration-300
          ${isOpen
            ? "bg-white"
            : "bg-white border-2 border-red-400"
          }
        `}
      />
    </button>
  );
}

// Main Content 

function StatusContent() {
  const { token } = useAdminAuth();

  // null = belum diketahui (loading), true = buka, false = tutup
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [fetching, setFetching] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch status toko saat halaman dimuat
  const fetchStatus = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/api/restaurant/status`);
      const data = await res.json();
      setIsOpen(data.status === "open");
    } catch {
      alert("Gagal memuat status toko.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Saat toggle ditekan → tampilkan konfirmasi
  const handleToggleRequest = () => {
    setShowConfirm(true);
  };

  // Konfirmasi disetujui → kirim ke API
  const handleConfirm = async () => {
    if (!token) return;
    const newStatus = isOpen ? "closed" : "open";
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/restaurant/status/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok || res.status === 204) {
        setIsOpen(!isOpen);
        setShowConfirm(false);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Gagal mengubah status toko.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Content */}
      <div className="p-4 mt-6">
        {fetching || isOpen === null ? (
          // Loading state
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-300 rounded-3xl p-6 flex flex-col gap-6">
            <p className="text-black text-xl font-medium">Status Aplikasi</p>

            <div className="flex justify-center py-2">
              <StatusToggle isOpen={isOpen} onToggleRequest={handleToggleRequest} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNav />

      {/* Confirmation Modal */}
      {showConfirm && isOpen !== null && (
        <ConfirmModal
          isOpen={!isOpen} // "ingin buka" berarti saat ini tutup, dst
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={saving}
        />
      )}
    </div>
  );
}

export default function AdminStatusPage() {
  return (
    <AdminGuard>
      <StatusContent />
    </AdminGuard>
  );
}