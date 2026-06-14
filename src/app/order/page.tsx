"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminGuard from "@/components/AdminGuard";
import { getOrders, updateOrderStatus } from "@/lib/order";
import { ResponseObject } from "@/utils/interfaces";
import { handleSessionExpiredError } from "@/lib/admins";

interface OrderItem {
  menu_id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: number;
  customer_id: number;
  total_price: number;
  // location: string | null;
  building: string | null;
  floor: string | null;
  extra: string | null;
  note: string | null;
  order_status: string;
  is_takeaway: boolean;
  has_fee: boolean;
  created_at?: string;
  // joined fields (bila backend dikembangkan)
  contact_name?: string;
  contact_number?: string;
  items?: OrderItem[];
}

const ORDER_STATUS_MAP: Record<string, string> = {
  PENDING: "Belum Dibayar",
  PROCESSING: "Sedang Dimasak",
  READY: "Siap Diambil/Diantar",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

// Detail Modal

function OrderDetailModal({
  order,
  onClose,
  onStatusUpdated,
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);

  // Hitung jumlah menu unik
  const menuCount = order.items?.length ?? 0;

  const getNextStatus = (current: string) => {
    switch (current) {
      case "PENDING":
        return "PROCESSING";
      case "PROCESSING":
        return "READY";
      case "READY":
        return "COMPLETED";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.order_status);

  const getButtonText = (current: string) => {
    switch (current) {
      case "PENDING":
        return "Terima & Proses Pesanan";
      case "PROCESSING":
        return "Pesanan Siap Diambil/Diantar";
      case "READY":
        return "Pesanan Selesai";
      default:
        return "Selesai";
    }
  };

  const handleLanjut = async () => {
    if (!nextStatus) return;

    setLoading(true);
    try {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("admin_token") || "";
      const res = await updateOrderStatus(order.order_id, nextStatus, token);
      if (res.status === 200 || res.status === 204) {
        onStatusUpdated();
        onClose();
      } else {
        const d = res.data as { message?: string };
        alert(d.message || "Gagal mengupdate status.");
      }
    } catch (err: any) {
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    setLoading(true);
    try {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("admin_token") || "";
      const res = await updateOrderStatus(order.order_id, "CANCELLED", token);
      if (res.status === 200 || res.status === 204) {
        onStatusUpdated();
        onClose();
      } else {
        const d = res.data as { message?: string };
        alert(d.message || "Gagal membatalkan pesanan.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat membatalkan pesanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 overflow-y-auto py-4 px-3">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl mx-auto my-auto">
        {/* Title */}
        <div className="px-6 pt-6 pb-3 border-b border-gray-200 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition active:scale-90 shrink-0"
            title="Kembali"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <h2
            className="text-xl font-bold text-black truncate"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Update Pesanan {order.contact_name}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 text-black">
          {/* Items */}
          <div>
            <p className="font-semibold text-base mb-2">
              Masakan Yang Dipesan:
            </p>
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <p key={item.menu_id} className="text-sm">
                  {item.quantity} x {item.name}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">
                Data item tidak tersedia
              </p>
            )}
          </div>

          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">
              Subtotal Pesanan ({menuCount} Menu)
            </p>
            <p className="text-sm font-semibold">
              Rp. {order.total_price?.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Buyer Info */}
          <div>
            <p className="font-semibold text-base mb-1">Info Pembeli :</p>
            <p className="text-sm text-gray-400 italic">
              Nama Pembeli: {order.contact_name ? order.contact_name : "-"}
            </p>
            <p className="text-sm text-gray-400 italic">
              Nomor WA: {order.contact_number ? order.contact_number : "-"}
            </p>
          </div>

          {/* Info Pengantaran*/}
          <div>
            <p className="font-semibold text-base mb-1">Info Pengantaran :</p>
            {order.building ? (
              <p className="text-sm">
                Diantar ke: {`Lt.${order.floor ? order.floor : "-"} Gedung ${order.building}, ${order.extra}`}
              </p>
            ) : order.is_takeaway ? (
              <p className="text-sm">Dibungkus (Takeaway)</p>
            ) : (
              <p className="text-sm">Makan di tempat (Dine-in)</p>
            )}
          </div>

          {/* Note */}
          <div>
            <p className="font-semibold text-base mb-1">Note Pembeli :</p>
            <p className="text-sm">
              {order.note || (
                <span className="text-gray-400 italic">Tidak ada catatan</span>
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {/* Cancel button */}
          {(order.order_status !== 'COMPLETED' && order.order_status !== 'CANCELLED') && (
            <button
              onClick={handleCancelOrder}
              disabled={loading}
              className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition active:scale-90 shrink-0"
              title="Batalkan Pesanan"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}

          {/* Lanjut button */}
          {nextStatus && (
            <button
              onClick={handleLanjut}
              disabled={loading}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-semibold transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Memproses..." : getButtonText(order.order_status)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Order Card Component

function OrderCard({
  order,
  onCekDetail,
}: {
  order: Order;
  onCekDetail: () => void;
}) {
  const menuCount = order.items?.length ?? 0;

  return (
    <div className="bg-gray-100 rounded-2xl overflow-hidden">
      {/* Order Header */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-300 flex justify-between items-center">
        <h3
          className="text-xl font-bold text-black truncate"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Pesanan{" "}
          {order.contact_name ? order.contact_name : order.contact_number}
        </h3>
        {order.created_at && (
          <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-md shrink-0 ml-2">
            {new Date(order.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* Location */}
        <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="12" cy="10" r="3" />
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 13 8 13s8-7.75 8-13a8 8 0 0 0-8-8z" />
          </svg>
          <p className="text-sm text-gray-700 truncate">
            {order.building
              ? `Diantar ke Gedung ${order.building}`
              : order.is_takeaway
                ? "Dibungkus (Takeaway)"
                : "Makan di tempat (Dine-in)"}
          </p>
        </div>

        {/* Items + Subtotal */}
        <div className="bg-white rounded-xl px-4 py-3 space-y-1">
          <p className="text-sm font-semibold text-black">Rincian Pesanan</p>
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div
                key={item.menu_id}
                className="flex justify-between items-center"
              >
                <p className="text-sm text-black">
                  {item.quantity} x {item.name}
                </p>
                <p className="text-sm text-black">
                  Rp. {(item.price * item.quantity).toLocaleString("id-ID")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">–</p>
          )}

          <div className="pt-1 border-t border-gray-100 mt-1">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-black">
                Subtotal Pesanan ({menuCount} Menu)
              </p>
              <p className="text-sm font-semibold text-black">
                Rp. {order.total_price?.toLocaleString("id-ID")}
              </p>
            </div>
            <p className="text-sm text-black">
              Status:{" "}
              <span className="font-medium">
                [{ORDER_STATUS_MAP[order.order_status] ?? order.order_status}]
              </span>
            </p>
          </div>
        </div>

        {/* Cek Detail */}
        <button
          onClick={onCekDetail}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl text-base font-semibold transition active:scale-95"
        >
          Cek Detail
        </button>
      </div>
    </div>
  );
}

// Main Page

function OrderListContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");
  const { logout } = useAdminAuth();

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    setFetching(true);
    try {
      // const res = await fetch(`${API_BASE}/api/order`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const data = await res.json();

      const res = (await getOrders(token)) as ResponseObject;
      const data = res.data as { orders?: Order[] };

      const rawOrders: Order[] = data?.orders ?? [];
      setOrders(rawOrders);
    } catch (error: any) {
      await handleSessionExpiredError(error, logout);
      alert("Gagal memuat daftar order.");
    } finally {
      setFetching(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const displayOrders = orders
    .filter((o) => {
      if (activeTab === "ongoing") {
        return o.order_status !== "COMPLETED" && o.order_status !== "CANCELLED";
      } else {
        return o.order_status === "COMPLETED" || o.order_status === "CANCELLED";
      }
    })
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="px-4 py-4 space-y-4">
      <h2
        className="text-2xl font-bold text-black"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Order List
      </h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mt-2 mb-4">
        <button
          onClick={() => setActiveTab("ongoing")}
          className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
            activeTab === "ongoing"
              ? "border-blue-600 text-blue-600 bg-blue-50/30"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Sedang Jalan
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600 bg-blue-50/30"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Selesai / Riwayat
        </button>
      </div>

      {fetching ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
          <span className="text-4xl">📋</span>
          <p className="text-sm">Belum ada order masuk.</p>
        </div>
      ) : (
        displayOrders.map((order) => (
          <OrderCard
            key={order.order_id}
            order={order}
            onCekDetail={() => setSelectedOrder(order)}
          />
        ))
      )}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={fetchOrders}
        />
      )}
    </div>
  );
}

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
      active: true,
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
          <span className="text-white text-[10px] font-medium">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Complete Page with Bottom Nav

function OrderPageContent() {
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <OrderListContent />
      <BottomNav />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <OrderPageContent />
    </AdminGuard>
  );
}
