"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { CldUploadWidget } from "next-cloudinary";
import AdminGuard from "@/components/AdminGuard";
import { uploadOptions } from "@/config/cloudinary";
import { Stack, Switch, Divider, Pagination } from "@mui/material";
import { upsertMenu, fetchMenu, deleteMenu } from "@/lib/menu";
import { handleSessionExpiredError } from "@/lib/admins";
import { useAdminAuth } from "@/context/AdminAuthContext";

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
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  item?: MenuItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [imagePreview, setImagePreview] = useState<string>(
    item?.image_url || "",
  );
  const [loading, setLoading] = useState(false);
  const [stockAvailable, setStockAvailable] = useState<boolean>(
    item?.is_available ?? true,
  );
  const { logout } = useAdminAuth();

  const handleSubmit = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    if (!name.trim()) return alert("Nama menu wajib diisi.");
    if (!price.trim() || isNaN(Number(price)))
      return alert("Harga harus berupa angka.");

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        price: Number(price),
        is_available: stockAvailable,
      };
      if (imagePreview) body.image_url = imagePreview;

      const url = mode === "add" ? `/menu` : `/menu/${item!.menu_id}`;

      const response = await upsertMenu(url, {
        mode: mode,
        token: token,
        body: body,
      });

      if (response.status === 201 || response.status === 204) {
        onSuccess();
      }
    } catch (err: any) {
      await handleSessionExpiredError(err, logout);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-gray-100 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Back button */}
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition active:scale-90 shrink-0"
          title="Kembali"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        {/* Image Area */}
        <div
          className="bg-red-500 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden"
          style={{ height: 160 }}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <span className="text-white text-5xl font-thin text-base text-center">
              Gambar menu akan ditampilkan di sini.
            </span>
          )}
        </div>

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
            className="w-full bg-white text-black placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
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
            className="w-full bg-white text-black placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Toggle stok tersedia  */}
        {mode !== "add" && (
          <div>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <label className="block text-sm font-medium text-black mb-1">
                Edit Stok
              </label>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <span className="block text-sm font-medium text-black mb-1">
                  Habis
                </span>
                <Switch
                  color="success"
                  defaultChecked={item?.is_available}
                  onChange={(e) => setStockAvailable(e.target.checked)}
                />
                <span className="block text-sm font-medium text-black mb-1">
                  Tersedia
                </span>
              </Stack>
            </Stack>
          </div>
        )}

        {/* Cloudinary upload widget (signed) */}
        <div>
          {/*currently unprotected from system's auth */}
          <CldUploadWidget
            signatureEndpoint="/api/sign-cloudinary-params"
            options={
              {
                ...uploadOptions(
                  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER,
                  item?.name,
                ),
              } as any
            }
            onSuccess={(result, { widget }) => {
              const info = result?.info as any;
              if (info.secure_url) setImagePreview(info.secure_url);
            }}
          >
            {({ open }) => {
              function handleOnClick() {
                open();
              }
              return (
                <button
                  onClick={handleOnClick}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-base font-semibold transition active:scale-95 disabled:opacity-50"
                >
                  {mode === "add" ? "Upload Gambar" : "Ganti Gambar"}
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
          {loading
            ? "Menyimpan..."
            : mode === "add"
              ? "Tambah Menu"
              : "Edit Menu"}
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
    <div className="bg-white rounded-2xl flex flex-col gap-2 shadow-sm border border-gray-100 p-2">
      <div className="flex flex-col gap-2">
        {/* Image */}
        <div
          className="bg-red-400 rounded-xl overflow-hidden"
          style={{ height: 120 }}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-red-400" />
          )}
        </div>

        {/* Info */}
        <div className="px-1">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <span
              className="text-black text-sm font-medium truncate"
              title={item.name}
            >
              {item.name}
            </span>
            {item.is_available ? (
              <span className="text-green-600 text-xs font-medium">Tersedia</span>
            ) : (
              <span className="text-red-700 text-xs font-medium">Habis</span>
            )}
          </Stack>
          <div className="flex justify-between items-center mt-1">
            <p className="text-black text-xs">Harga</p>
            <p className="text-black text-xs font-semibold">
              {item.price
                ? `Rp ${item.price.toLocaleString("id-ID")}`
                : "------"}
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-2.5 bg-red-400 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition active:scale-95"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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

// Menu List Row

function MenuListRow({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-3 flex items-center gap-4 shadow-sm border border-gray-100">
      <div
        className="bg-red-400 rounded-xl overflow-hidden flex-shrink-0"
        style={{ width: 64, height: 64 }}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-red-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-black text-sm font-semibold truncate" title={item.name}>
          {item.name}
        </h3>
        <p className="text-gray-500 text-xs mt-1">
          {item.price ? `Rp ${item.price.toLocaleString("id-ID")}` : "------"}
        </p>
      </div>
      <div className="flex-shrink-0 text-right w-16">
        {item.is_available ? (
          <span className="text-green-600 text-xs font-medium">Tersedia</span>
        ) : (
          <span className="text-red-700 text-xs font-medium">Habis</span>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0 ml-2">
        <button
          onClick={onEdit}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition active:scale-95"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="w-10 h-10 bg-red-400 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition active:scale-95"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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

// Main Page

function CMSMenuContent() {
  const LIMIT_DEFAULT = 8;
  const [limit] = useState(LIMIT_DEFAULT);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [fetching, setFetching] = useState(true);

  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMenus = async () => {
    setFetching(true);
    try {
      const res = await fetchMenu(offset, limit);
      const data = res.data as any;
      setMenus(data?.data || []);
      setTotalCount(data?.count || 0);
    } catch {
      alert("Gagal memuat menu.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit]);

  function handlePageChange(event: ChangeEvent<unknown>, value: number) {
    setOffset((value - 1) * limit);
    setPage(value);
  }

  const handleDelete = async () => {
    const token = localStorage.getItem("admin_token");
    if (!deleteItem || !token) return;
    setDeleteLoading(true);
    try {
      const res = await deleteMenu(deleteItem.menu_id, token);
      const data = res.data as any;
      if (res.status === 200 || res.status === 204) {
        setDeleteItem(null);
        fetchMenus();
      } else {
        alert(data?.message || "Gagal menghapus menu.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const sortedMenus = [...menus].sort((a, b) => {
    if (a.is_available === b.is_available) return 0;
    return a.is_available ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Tombol Tambah & Toggle View */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === "card" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
          >
            Card
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === "list" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
          >
            List
          </button>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition active:scale-95 shadow-lg z-30 md:bottom-10 md:right-10"
          title="Tambah Menu"
        >
          <span className="text-white text-3xl font-light leading-none">+</span>
        </button>
      </div>

      {/* Grid / List */}
      <div className="p-4 pt-0">
        {fetching ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedMenus.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <span className="text-4xl">🍽️</span>
            <p className="text-sm">Belum ada menu. Tekan + untuk menambah.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {viewMode === "card" ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {sortedMenus.map((item) => (
                  <MenuCard
                    key={item.menu_id}
                    item={item}
                    onEdit={() => setEditItem(item)}
                    onDelete={() => setDeleteItem(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedMenus.map((item) => (
                  <MenuListRow
                    key={item.menu_id}
                    item={item}
                    onEdit={() => setEditItem(item)}
                    onDelete={() => setDeleteItem(item)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex flex-col items-center pt-6 pb-2 gap-4 w-full">
                {page >= Math.ceil(totalCount / limit) && (
                  <Divider className="text-xs px-6 mb-2 w-full text-gray-400">
                    Anda telah mencapai akhir halaman~
                  </Divider>
                )}
                <Pagination
                  count={Math.ceil(totalCount / limit)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  size="medium"
                  siblingCount={1}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {addModal && (
        <MenuFormModal
          mode="add"
          onClose={() => setAddModal(false)}
          onSuccess={() => {
            setAddModal(false);
            fetchMenus();
          }}
        />
      )}

      {editItem && (
        <MenuFormModal
          mode="edit"
          item={editItem}
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
