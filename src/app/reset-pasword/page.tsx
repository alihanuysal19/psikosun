"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/guards/supabase/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Şifre başarıyla güncellendi. Şimdi giriş yapabilirsin.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-lightprimary dark:bg-darkprimary px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-semibold">Yeni Şifre Belirle</h1>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Yeni Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Yeni şifreni gir"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
