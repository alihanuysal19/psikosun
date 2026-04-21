import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/app/components/shared/AuthShell";
import AuthForgotPassword from "../authforms/AuthForgotPassword";

export const metadata: Metadata = { title: "Şifremi Unuttum — psikosun" };

const ForgotPasswordPage = () => (
  <AuthShell
    title="Şifre sıfırlama"
    subtitle="E-posta adresinize sıfırlama bağlantısı gönderelim."
    footer={
      <Link href="/auth/login" className="hover:text-primary">
        ← Giriş ekranına dön
      </Link>
    }
  >
    <AuthForgotPassword />
  </AuthShell>
);

export default ForgotPasswordPage;
