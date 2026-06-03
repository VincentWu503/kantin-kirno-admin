"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { CldUploadWidget } from 'next-cloudinary';
import AdminGuard from "@/components/AdminGuard";
import { uploadOptions } from "@/config/cloudinary";
import { Stack, Switch, Divider } from "@mui/material";
import { upsertMenu } from "@/lib/menu";

const API_BASE = "http://localhost:5000";

interface MenuItem {
  menu_id: number;
  name: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

// Modal Tambah / Edit Menu 

function MenuFormModal({
  mode,
  item,
  token,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  item?: MenuItem;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [imagePreview, setImagePreview] = useState<string>(item?.image_url || "");
  const [loading, setLoading] = useState(false);
  const [stockAvailable, setStockAvailable] = useState<boolean>(item?.is_available ?? true);

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Nama menu wajib diisi.");
    if (!price.trim() || isNaN(Number(price))) return alert("Harga harus berupa angka.");

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        price: Number(price),
        is_available: stockAvailable,
      };
      if (imagePreview) body.image_url = imagePreview;

      // const url =
      //   mode === "add"
      //     ? `${API_BASE}/api/menu`
      //     : `${API_BASE}/api/menu/${item!.menu_id}`;
      const url =
        mode === "add"
          ? `/menu`
          : `/menu/${item!.menu_id}`;

      // const response = await fetch(url, {
      //   method: mode === "add" ? "POST" : "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(body),
      // });
      const response = await upsertMenu(url, {
        mode: mode,
        token: token,
        body: body, // JSON stringify di lib
      })

      if (response.status === 201 || response.status === 204) {
        onSuccess();
      } 
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-gray-100 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-xl">
        {/* Back button */}
        <button onClick={onClose} className="text-black text-xl font-bold">
          ←
        </button>

        {/* Image Area */}
        <div
          className="bg-red-500 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden"
          style={{ height: 160 }}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <span className="text-white text-5xl font-thin text-base text-center">Gambar menu akan ditampilkan di sini.</span>
          )}
        </div>
        {/* <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} /> */}

        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            {mode === "add" ? "Tambah Nama" : "Edit Nama"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama makanan"
            className="w-full bg-blue-500 text-white placeholder-blue-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Price Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            {mode === "add" ? "Tambah Harga" : "Edit Harga"}
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Harga (Rp)"
            className="w-full bg-blue-500 text-white placeholder-blue-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Toggle stok tersedia  */}
        {mode !== "add" && 
          <div> 
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between'}}>
              <label className="block text-sm font-medium text-black mb-1">
                Edit Stok
              </label>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <span className="block text-sm font-medium text-black mb-1">Habis</span>
                    <Switch color="success" 
                            defaultChecked={item?.is_available} 
                            onChange={(e) => setStockAvailable(e.target.checked)}
                    />   
                <span className="block text-sm font-medium text-black mb-1">Tersedia</span>
              </Stack>     
            </Stack>    
          </div>
        }

        {/* Cloudinary upload widget (signed) */}
        <div>       
          <CldUploadWidget
            signatureEndpoint="/api/sign-cloudinary-params"
            // profil bakal beda folder
            options={{...uploadOptions(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER, item?.name)} as any}
            onSuccess={(result, { widget }) => {
              const info = result?.info as any

              // setCloudinaryResponse(info);  // { public_id, secure_url, etc }
              
              if (info.secure_url) setImagePreview(info.secure_url);
            }}
          >
            {({ open }) => {
              function handleOnClick() {
                open();
              }
              return (
                <button onClick={handleOnClick} 
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-base font-semibold transition active:scale-95 disabled:opacity-50"
                >
                  { mode === "add" ? "Upload Gambar" : "Ganti Gambar"}
                </button>
              );
            }}
          </CldUploadWidget>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-base font-semibold transition active:scale-95 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : mode === "add" ? "Tambah Menu" : "Edit Menu"}
        </button>
      </div>
    </div>
  );
}

// Delete Confirmation 

function DeleteModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="bg-gray-100 rounded-3xl w-full max-w-xs p-6 text-center shadow-xl space-y-5">
        <p className="text-black text-lg font-semibold leading-snug">
          Apakah Anda ingin menghapus Menu ini?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition active:scale-95"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition active:scale-95"
          >
            {loading ? "..." : "Ya"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Menu Card 

function MenuCard({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-black-500 flex flex-col gap-2">
      <div className="rounded-2xl p-2 flex flex-col gap-2">
        {/* Image */}
        <div className="bg-red-400 rounded-xl overflow-hidden" style={{ height: 120 }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-red-400" />
          )}
        </div>

        {/* Info */}
        <div className="px-1">
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent:'space-between'}}>
              <span className="text-black text-sm font-medium truncate">{item.name}</span>
              {
                item.is_available ? 
                <span className="text-green-600 text-sm font">Tersedia</span> : 
                <span className="text-red-700 text-sm font">Habis</span>
              }
          </Stack>   
          <div className="flex justify-between items-center">
            <p className="text-black text-xs">Harga</p>
            <p className="text-black text-xs font-semibold">
              {item.price ? `Rp ${item.price.toLocaleString("id-ID")}` : "------"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-2.5 bg-red-400 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      ),
      onClick: () => router.push("/order"),
    },
    {
      label: "Edit",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      onClick: () => {},
      active: true,
    },
    {
      label: "Close",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
      ),
      onClick: () => router.push("/admin/status"),
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

// Main Page 

function CMSMenuContent() {
  const { token, getAdminPayload } = useAdminAuth();

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [fetching, setFetching] = useState(true);

  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMenus = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/api/menu`);
      const data = await res.json();
      setMenus(data.data?.rows || data.data || []);
    } catch {
      alert("Gagal memuat menu.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleDelete = async () => {
    if (!deleteItem || !token) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/menu/${deleteItem.menu_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) {
        setDeleteItem(null);
        fetchMenus();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || "Gagal menghapus menu.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Grid */}
      <div className="p-4 flex items-end justify-end">
        <button
          onClick={() => setAddModal(true)}
          className="fixed bottom-32 right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition active:scale-95 shadow-lg z-30"
          title="Tambah Menu"
        >
          <span className="text-white text-3xl font-light leading-none">+</span>
        </button>
      </div>
      <div className="p-4">
        {fetching ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <span className="text-4xl">🍽️</span>
            <p className="text-sm">Belum ada menu. Tekan + untuk menambah.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {menus.map((item) => (
              <MenuCard
                key={item.menu_id}
                item={item}
                onEdit={() => setEditItem(item)}
                onDelete={() => setDeleteItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      {/* Modals */}
      {addModal && token && (
        <MenuFormModal
          mode="add"
          token={token}
          onClose={() => setAddModal(false)}
          onSuccess={() => {
            setAddModal(false);
            fetchMenus();
          }}
        />
      )}

      {editItem && token && (
        <MenuFormModal
          mode="edit"
          item={editItem}
          token={token}
          onClose={() => setEditItem(null)}
          onSuccess={() => {
            setEditItem(null);
            fetchMenus();
          }}
        />
      )}

      {deleteItem && (
        <DeleteModal
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}

export default function AdminMenuPage() {
  return (
    <AdminGuard>
      <CMSMenuContent />
    </AdminGuard>
  );
}