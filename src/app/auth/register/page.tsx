import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/app/components/shared/AuthShell";
import AuthRegister from "../authforms/AuthRegister";

export const metadata: Metadata = { title: "Kayıt Ol — psikosun" };

const RegisterPage = () => (
  <AuthShell
    title="Kayıt"
    subtitle="Yeni bir hesap oluşturun."
    footer={
      <div className="flex gap-2 items-center justify-center">
        <span>Zaten hesabınız var mı?</span>
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Giriş yapın
        </Link>
      </div>
    }
  >
    <AuthRegister />
  </AuthShell>
);

export default RegisterPage;
