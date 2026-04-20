"use client"
import CardBox from "@/app/components/shared/CardBox";
import React from "react";
import AuthLogin from "../authforms/AuthLogin";
import Link from "next/link";

const BoxedLogin = () => {
  return (
    <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
      <div className="flex h-full justify-center items-center px-4">
        <CardBox className="md:w-[420px] w-full border-none">
          {/* Marka */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight">psikosun</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hesabınıza giriş yapın</p>
          </div>

          <AuthLogin />

          <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium mt-6 items-center justify-center">
            <p>Hesabınız yok mu?</p>
            <Link href="/auth/register" className="text-primary font-semibold hover:underline">
              Kayıt olun
            </Link>
          </div>
        </CardBox>
      </div>
    </div>
  );
};

export default BoxedLogin;
