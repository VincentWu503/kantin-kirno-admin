"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { handleLoginApi } from "@/lib/admins";
import { Divider } from "@mui/material";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await handleLoginApi({
        email,
        password,
      });

      if (response.status === 200) {
        const token =
          (response as { data?: { token?: string } }).data?.token || "";
        if (token) {
          login(token);
          router.push("/admin/menu");
        } else {
          setErrorMessage("Login gagal: token tidak ditemukan");
        }
      } else {
        setErrorMessage(
          (response as { message?: string }).message || "Login gagal",
        );
      }
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Unknown error";

      try {
        const errData = JSON.parse(message) as { message?: string };
        setErrorMessage(errData.message || "Login gagal");
      } catch {
        setErrorMessage("Terjadi kesalahan: " + message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-blue-500 h-40 flex items-center justify-center">
        <div className="w-28 h-28 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center text-center mb-6">
          <Image
            src="/kirno_logo_512.png"
            width={512}
            height={512}
            alt="Logo"
          />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white -mt-6 rounded-t-3xl p-6 flex flex-col">
        <form
          onSubmit={handleLogin}
          className="bg-gray-100 p-6 rounded-2xl space-y-4 max-w-md w-full mx-auto"
        >
          <h2 className="text-xl font-bold text-black text-center mb-2">
            Login Admin
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
              required
            />

            <div className="mt-2 text-[11px] leading-4 text-gray-600">
              <div className="font-semibold text-gray-800">Ketentuan password:</div>
              <ul className="list-disc pl-5">
                <li>Minimal 12 karakter (maks 30)</li>
                <li>Harus ada huruf besar, huruf kecil, angka, dan spesial <span className="font-mono">#@$!%*?&</span></li>
              </ul>
            </div>
          </div>

          {errorMessage && (
            <span className="text-sm font-medium mb-1 text-red-600">
              {errorMessage}
            </span>
          )}

          <Divider sx={{ my: 1 }}></Divider>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-base font-semibold mt-2 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
