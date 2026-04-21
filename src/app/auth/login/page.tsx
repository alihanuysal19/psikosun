import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/app/components/shared/AuthShell";
import AuthLogin from "../authforms/AuthLogin";

export const metadata: Metadata = { title: "Giriş Yap — psikosun" };

const LoginPage = () => (
  <AuthShell
    title="Giriş"
    subtitle="Hesabınıza güvenli giriş yapın."
    footer={
      <div className="flex gap-2 items-center justify-center">
        <span>Hesabınız yok mu?</span>
        <Link href="/auth/register" className="font-semibold text-primary hover:underline">
          Kayıt olun
        </Link>
      </div>
    }
  >
    <AuthLogin />
    <div className="mt-5 text-center">
      <Link href="/auth/forgot-password" className="text-xs text-gray-400 hover:text-primary">
        Şifremi unuttum
      </Link>
    </div>
  </AuthShell>
);

export default LoginPage;
