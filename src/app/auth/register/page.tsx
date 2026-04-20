import CardBox from "@/app/components/shared/CardBox";
import React from "react";
import AuthRegister from "../authforms/AuthRegister";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kayıt Ol — psikosun" };

const RegisterPage = () => {
  return (
    <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
      <div className="flex h-full justify-center items-center px-4">
        <CardBox className="md:w-[420px] w-full border-none">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight">psikosun</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Yeni hesap oluşturun</p>
          </div>
          <AuthRegister />
          <div className="flex gap-2 text-sm text-gray-500 font-medium mt-6 items-center justify-center">
            <p>Zaten hesabınız var mı?</p>
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Giriş yapın
            </Link>
          </div>
        </CardBox>
      </div>
    </div>
  );
};

export default RegisterPage;
