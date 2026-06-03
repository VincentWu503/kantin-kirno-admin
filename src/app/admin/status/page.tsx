"use client";

import { useState, useEffect, useRef } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminGuard from "@/components/AdminGuard";
import { getRestaurantStatus, updateRestaurantStatus } from "@/lib/restaurant";

// SwipeToConfirm Component
function SwipeToConfirm({
  onConfirm,
  loading,
  text = "Geser untuk konfirmasi",
  colorClass = "bg-blue-500"
}: {
  onConfirm: () => void;
  loading: boolean;
  text?: string;
  colorClass?: string;
}) {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (loading) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current || !knobRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const knobWidth = knobRef.current.offsetWidth;
    const maxPosition = containerWidth - knobWidth;

    const rect = containerRef.current.getBoundingClientRect();
    let newPosition = e.clientX - rect.left - knobWidth / 2;

    if (newPosition < 0) newPosition = 0;
    if (newPosition > maxPosition) newPosition = maxPosition;

    setPosition(newPosition);

    if (newPosition >= maxPosition - 5) {
      setIsDragging(false);
      onConfirm();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!loading) {
      setPosition(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-14 bg-gray-100 rounded-full overflow-hidden select-none border border-gray-200"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`font-semibold text-sm sm:text-base ${loading ? 'text-gray-400' : 'text-gray-500'}`}>
          {loading ? "Memproses..." : text}
        </span>
      </div>
      
      <div
        className={`absolute left-0 top-0 h-full ${colorClass} opacity-20 pointer-events-none transition-all`}
        style={{ width: `${position + 24}px` }} 
      />

      <div
        ref={knobRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute left-1 top-1 h-12 w-12 bg-white border shadow-sm rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing ${
          isDragging ? "" : "transition-transform duration-300"
        }`}
        style={{ transform: `translateX(${position}px)`, touchAction: "none" }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
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
  isOpen: boolean; // Tindakan yang akan dilakukan (true = Buka, false = Tutup)
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl space-y-6 relative border border-gray-100 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${isOpen ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
          {isOpen ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            {isOpen ? "Buka Warung?" : "Tutup Warung?"}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isOpen 
              ? "Pelanggan akan bisa memesan makanan kembali setelah warung dibuka." 
              : "Warung akan ditutup untuk pesanan baru. Pesanan yang sudah ada tetap harus diselesaikan."}
          </p>
        </div>

        <div className="pt-2 pb-2">
          <SwipeToConfirm 
            onConfirm={onConfirm} 
            loading={loading} 
            text={isOpen ? "Geser untuk Buka >>" : "Geser untuk Tutup >>"}
            colorClass={isOpen ? "bg-green-500" : "bg-red-500"}
          />
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
        relative w-52 h-14 rounded-full flex items-center transition-all duration-300 focus:outline-none shadow-sm
        ${
          isOpen
            ? "bg-green-500 justify-end pr-1"
            : "bg-white border-2 border-red-400 justify-start pl-1"
        }
      `}
      aria-label={isOpen ? "Tutup toko" : "Buka toko"}
    >
      <span
        className={`
          absolute text-sm font-bold tracking-widest select-none transition-all duration-300
          ${isOpen ? "left-5 text-white" : "right-5 text-red-500"}
        `}
      >
        {isOpen ? "BUKA" : "TUTUP"}
      </span>

      <span
        className={`
          w-11 h-11 rounded-full shadow-md flex-shrink-0 transition-all duration-300 flex items-center justify-center
          ${isOpen ? "bg-white" : "bg-red-50"}
        `}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        )}
      </span>
    </button>
  );
}

// Main Content

function StatusContent() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [fetching, setFetching] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchStatus = async () => {
    setFetching(true);
    try {
      const res = await getRestaurantStatus();
      const data = res.data as { status: string };
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

  const handleToggleRequest = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('admin_token') ||  "";
    if (!token) return;
    const newStatus = isOpen ? "closed" : "open";
    setSaving(true);
    try {
      const res = await updateRestaurantStatus(newStatus, token);
      if (res.status === 200 || res.status === 204) {
        setIsOpen(!isOpen);
        setShowConfirm(false);
      } else {
        const data = res.data as { message?: string };
        alert(data.message || "Gagal mengubah status toko.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!saving) {
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-6 py-8 shadow-sm rounded-b-3xl mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Status Warung</h1>
        <p className="text-gray-500 mt-2 text-sm">Atur apakah warung sedang menerima pesanan atau tutup.</p>
      </div>

      <div className="p-6">
        {fetching || isOpen === null ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-8 shadow-sm border border-gray-100">
            <div className="text-center space-y-2">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Status Saat Ini</p>
              <h2 className={`text-3xl font-bold ${isOpen ? 'text-green-500' : 'text-red-500'}`}>
                {isOpen ? 'BUKA' : 'TUTUP'}
              </h2>
            </div>

            <StatusToggle
              isOpen={isOpen}
              onToggleRequest={handleToggleRequest}
            />
          </div>
        )}
      </div>

      {showConfirm && isOpen !== null && (
        <ConfirmModal
          isOpen={!isOpen} 
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
