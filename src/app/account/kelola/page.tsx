"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminGuard from "@/components/AdminGuard";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  handleSessionExpiredError,
} from "@/lib/admins";

interface AdminItem {
  admin_id: string;
  username: string | null;
  email: string;
  super_admin: boolean;
  verified: boolean;
}

type ViewMode = "list" | "add" | "edit";

// view tambah & edit

function BlueHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="bg-blue-500 flex items-center gap-3 px-4 py-4">
      <button
        onClick={onBack}
        className="text-black text-2xl font-light hover:opacity-70"
      >
        ←
      </button>
      <span className="text-black text-xl font-semibold">{title}</span>
    </div>
  );
}

// Konfirmasi Hapus

function DeleteConfirmModal({
  adminEmail,
  onConfirm,
  onCancel,
  loading,
}: {
  adminEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-6">
      <div className="bg-gray-200 rounded-3xl w-full max-w-xs p-6 text-center shadow-xl space-y-6">
        <p className="text-black text-lg font-medium leading-snug">
          Apakah Anda yakin ingin menghapus{" "}
          <span className="font-semibold">{adminEmail}</span>?
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

// Form Tambah Admin

function AddAdminForm({
  token,
  onBack,
  onSuccess,
}: {
  token: string | null;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    setError("");
    if (!email.trim()) return setError("E-mail wajib diisi.");
    if (!password) return setError("Password wajib diisi.");
    if (password !== confirmPassword)
      return setError("Password dan konfirmasi tidak sesuai.");
    if (password.length < 6) return setError("Password minimal 6 karakter.");

    setLoading(true);
    try {
      const res = await createAdmin(
        { email: email.trim(), password, confirm_password: confirmPassword },
        token || "",
      );
      if (res.status === 200 || res.status === 201) {
        onSuccess();
      } else {
        const data = res.data as { message?: string };
        setError(data.message || "Gagal menambah admin.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <BlueHeader title="Tambah Akun Admin" onBack={onBack} />

      <div className="p-6 mt-6">
        <div className="bg-gray-200 rounded-3xl p-5 space-y-4">
          {/* E-Mail */}
          <div>
            <label className="block text-black text-base mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-black text-base mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-black text-base mb-1">
              Konformasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Tombol Add */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="px-10 py-3 bg-gray-300 hover:bg-gray-400 text-black rounded-2xl font-semibold border border-gray-400 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Form Edit Admin

function EditAdminForm({
  item,
  token,
  onBack,
  onSuccess,
}: {
  item: AdminItem;
  token: string | null;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState(item.email);
  const [superAdmin, setSuperAdmin] = useState(item.super_admin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!email.trim()) {
      return setError("E-mail wajib diisi.");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return;
      const body: Record<string, string | boolean> = {};
      if (email.trim()) body.email = email.trim();
      if (superAdmin !== item.super_admin) body.super_admin = superAdmin;

      const res = await updateAdmin(item.admin_id, body, token);
      if (res.status === 200 || res.status === 204) {
        onSuccess();
      } else {
        const data = res.data as { message?: string };
        setError(data.message || "Gagal menyimpan perubahan.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <BlueHeader title="Edit Akun Admin" onBack={onBack} />

      <div className="p-6 mt-6">
        <div className="bg-gray-200 rounded-3xl p-5 space-y-4">
          {/* E-mail */}
          <div>
            <label className="block text-black text-base mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {/* Toggle Super Admin*/}
          <div>
            <div className="flex justify-between items-center gap-2">
              <label className="w-full block text-black text-base mb-1">
                Jadikan Super Admin
              </label>
              <input
                type="checkbox"
                onChange={(e) => setSuperAdmin(e.target.checked)}
                className=" w-[1.25em] h-[1.25em] shrink-0 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                checked={superAdmin}
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Tombol */}
          <div className="flex gap-4 justify-center pt-2">
            <button
              onClick={onBack}
              disabled={loading}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold transition active:scale-95 disabled:opacity-50"
            >
              Tidak
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "..." : "Ya"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Daftar Admin (List View)
function AdminList({
  admins,
  onAdd,
  onEdit,
  onDeleteRequest,
  onBack,
}: {
  admins: AdminItem[];
  onAdd: () => void;
  onEdit: (item: AdminItem) => void;
  onDeleteRequest: (item: AdminItem) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <BlueHeader title="Kelola Admin" onBack={onBack} />

      {/* Add Button */}
      <div className="p-4">
        <button
          onClick={onAdd}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold transition active:scale-95"
        >
          + Tambah Admin Baru
        </button>
      </div>

      {/* Tabel admin */}
      <div className="mt-2">
        {admins.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-gray-400">
            <p className="text-sm">Belum ada admin lain.</p>
          </div>
        ) : (
          admins.map((item, idx) => (
            <div
              key={item.admin_id}
              className={`flex items-center justify-between px-4 py-4 ${
                idx % 2 === 0 ? "bg-gray-300" : "bg-gray-200"
              }`}
            >
              {/* Email */}
              <span className="text-black text-base">
                {item.email}
                {item.super_admin && (
                  <span className="ml-2 text-xs text-blue-600 font-semibold">
                    (Super)
                  </span>
                )}
              </span>

              {/* Tombol aksi */}
              <div className="flex gap-2">
                {/* Edit — bisa untuk semua termasuk super admin */}
                <button
                  onClick={() => onEdit(item)}
                  className="w-12 h-12 bg-blue-400 hover:bg-blue-500 rounded-2xl flex items-center justify-center transition active:scale-95"
                >
                  <svg
                    width="20"
                    height="20"
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

                {/* Hapus — dinonaktifkan untuk super admin */}
                <button
                  onClick={() => !item.super_admin && onDeleteRequest(item)}
                  disabled={item.super_admin}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition active:scale-95 ${
                    item.super_admin
                      ? "bg-red-200 cursor-not-allowed opacity-40"
                      : "bg-red-400 hover:bg-red-500"
                  }`}
                  title={
                    item.super_admin
                      ? "Super admin tidak bisa dihapus"
                      : "Hapus admin"
                  }
                >
                  <svg
                    width="20"
                    height="20"
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
          ))
        )}
      </div>
    </div>
  );
}

// Main Kelola Page

function KelolaContent() {
  const router = useRouter();
  const { admin: currentAdmin } = useAdminAuth();

  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [view, setView] = useState<ViewMode>("list");
  const [editTarget, setEditTarget] = useState<AdminItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { logout } = useAdminAuth();

  // Hooks must be called unconditionally
  const fetchAdmins = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    setFetching(true);
    try {
      const res = await getAdmins(token);
      const data = res.data as { data?: AdminItem[]; admins?: AdminItem[] };
      setAdmins(data.data || data.admins || []);
    } catch (err: any) {
      await handleSessionExpiredError(err, logout);
      alert("Gagal memload daftar admin.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token && currentAdmin) {
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAdmin]);

  // Guard: hanya super admin yang boleh masuk
  if (currentAdmin && !currentAdmin.super_admin) {
    router.replace("/admin/account");
    return null;
  }

  const handleDelete = async () => {
    const token = localStorage.getItem("admin_token");
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      const res = await deleteAdmin(deleteTarget.admin_id, token);
      if (res.status === 200 || res.status === 204) {
        setDeleteTarget(null);
        fetchAdmins();
      } else {
        const d = res.data as { message?: string };
        alert(d.message || "Gagal menghapus admin.");
      }
    } catch (err: any) {
      await handleSessionExpiredError(err, logout);
      alert("Terjadi kesalahan.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Render berdasarkan view state
  if (view === "add") {
    return (
      <AddAdminForm
        token={localStorage.getItem("admin_token")}
        onBack={() => setView("list")}
        onSuccess={() => {
          setView("list");
          fetchAdmins();
        }}
      />
    );
  }

  if (view === "edit" && editTarget) {
    return (
      <EditAdminForm
        item={editTarget}
        token={localStorage.getItem("admin_token")}
        onBack={() => {
          setView("list");
          setEditTarget(null);
        }}
        onSuccess={() => {
          setView("list");
          setEditTarget(null);
          fetchAdmins();
        }}
      />
    );
  }

  // tampilkan list
  return (
    <>
      {fetching ? (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AdminList
          admins={admins}
          onAdd={() => setView("add")}
          onEdit={(item) => {
            setEditTarget(item);
            setView("edit");
          }}
          onDeleteRequest={(item) => setDeleteTarget(item)}
          onBack={() => router.back()}
        />
      )}

      {/* Modal konfirmasi hapus */}
      {deleteTarget && (
        <DeleteConfirmModal
          adminEmail={deleteTarget.email}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </>
  );
}

export default function KelolaAdminPage() {
  return (
    <AdminGuard>
      <KelolaContent />
    </AdminGuard>
  );
}
