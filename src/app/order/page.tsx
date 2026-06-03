"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminGuard from "@/components/AdminGuard";
import { getOrders } from "@/lib/order";
import { ResponseObject } from "@/utils/interfaces";
import { ENV } from "@/config/env";

const API_BASE = ENV.API_URL;

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
  location: string | null;
  note: string | null;
  status: string;
  is_takeaway: boolean;
  has_fee: boolean;
  created_at?: string;
  // joined fields (bila backend dikembangkan)
  customer_name?: string;
  customer_phone?: string;
  items?: OrderItem[];
}

// Detail Modal

function OrderDetailModal({
  order,
  token,
  onClose,
  onStatusUpdated,
}: {
  order: Order;
  token: string;
  onClose: () => void;
  onStatusUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);

  // Hitung jumlah menu unik
  const menuCount = order.items?.length ?? 0;

  const handleLanjut = async () => {
    setLoading(true);
    try {
      // Endpoint patch status (sesuaikan jika backend sudah ada)
      // Sementara menggunakan PATCH /api/order/:id
      const res = await fetch(`${API_BASE}/api/order/${order.order_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "delivering" }),
      });

      if (res.ok || res.status === 204) {
        onStatusUpdated();
        onClose();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || "Gagal mengupdate status.");
      }
    } catch {
      // Jika endpoint belum ada, tutup modal saja
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 overflow-y-auto py-4 px-3">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl mx-auto my-auto">
        {/* Title */}
        <div className="px-6 pt-6 pb-3 border-b border-gray-200">
          <h2
            className="text-2xl font-bold text-black"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Update Status Order #{order.order_id}
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
            {order.customer_name ? (
              <p className="text-sm">
                {order.customer_name}
                {order.customer_phone ? ` ( ${order.customer_phone} )` : ""}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                ID Pembeli: {order.customer_id}
              </p>
            )}
            {order.location && <p className="text-sm">{order.location}</p>}
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
          {/* Back button */}
          <button
            onClick={onClose}
            className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition active:scale-90 shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>

          {/* Lanjut button */}
          <button
            onClick={handleLanjut}
            disabled={loading}
            className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-semibold transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Lanjut Ke Pengantaran makanan"}
          </button>
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
      <div className="px-4 pt-4 pb-2 border-b border-gray-300">
        <h3
          className="text-xl font-bold text-black"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Order #{order.order_id}
        </h3>
      </div>

      <div className="p-3 space-y-2">
        {/* Location */}
        {order.location && (
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
            <p className="text-sm text-gray-700 truncate">{order.location}</p>
          </div>
        )}

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
              <span className="font-medium">[{order.status ?? "pending"}]</span>
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
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
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
    } catch {
      alert("Gagal memuat daftar order.");
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="px-4 py-4 space-y-4">
      <h2
        className="text-2xl font-bold text-black"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Order List
      </h2>

      {fetching ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
          <span className="text-4xl">📋</span>
          <p className="text-sm">Belum ada order masuk.</p>
        </div>
      ) : (
        orders.map((order) => (
          <OrderCard
            key={order.order_id}
            order={order}
            onCekDetail={() => setSelectedOrder(order)}
          />
        ))
      )}

      {selectedOrder && token && (
        <OrderDetailModal
          order={selectedOrder}
          token={token}
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
