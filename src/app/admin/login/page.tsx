"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { handleLoginApi } from "@/lib/admins";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // const response = await fetch("http://localhost:5000/api/auth/admin/login", {
      //   method: "POST",
      //   credentials: 'include',
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });
      const response = await handleLoginApi({email, password}) as any;

      if (response.status === 200) {
        login(response.data.token);
        router.push("/admin/menu");
      } else {
        alert(response.message || "Login gagal");
      }
    } catch (err) {
      alert("Terjadi kesalahan: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-blue-500 h-40 flex items-center justify-center">
        <div className="w-28 h-28 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center text-center mb-6">
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white -mt-6 rounded-t-3xl p-6 flex flex-col">
        <form
          onSubmit={handleLogin}
          className="bg-gray-100 p-6 rounded-2xl space-y-4 max-w-md w-full mx-auto"
        >
          <h2 className="text-xl font-bold text-black text-center mb-2">Login Admin</h2>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">Email</label>
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
            <label className="block text-sm font-medium mb-1 text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
              required
            />
          </div>

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