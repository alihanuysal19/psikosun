"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Alert, Button, Label, TextInput } from "flowbite-react";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "@/app/context/AuthContext";
import { setRememberMe, getRememberMe } from "@/app/guards/supabase/supabaseClient";

const AuthLogin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { signin } = useContext(AuthContext);

  useEffect(() => {
    setRemember(getRememberMe());
  }, []);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      setRememberMe(remember);
      await signin(email, password);
      router.push("/panel");
    } catch (err: any) {
      setError(err?.message || "E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4">
          <Alert
            color="failure"
            icon={() => (
              <Icon icon="solar:info-circle-outline" className="me-3" height={20} />
            )}
          >
            {error}
          </Alert>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email">E-posta</Label>
          </div>
          <TextInput
            id="email"
            type="email"
            sizing="md"
            placeholder="ornek@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="password">Şifre</Label>
          </div>
          <div className="relative">
            <TextInput
              id="password"
              type={showPw ? "text" : "password"}
              sizing="md"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
              tabIndex={-1}
            >
              <Icon icon={showPw ? "tabler:eye-off" : "tabler:eye"} width={18} />
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Beni hatırla
          </span>
          <span className="text-xs text-gray-400 ml-1">
            {remember ? "(tarayıcıyı kapatsan bile açık kalır)" : "(tab kapanınca çıkış)"}
          </span>
        </label>

        <Button
          color="primary"
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primaryemphasis text-white rounded-md w-full"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
