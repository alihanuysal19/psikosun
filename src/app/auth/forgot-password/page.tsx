import CardBox from "@/app/components/shared/CardBox";
import React from "react";
import AuthForgotPassword from "../authforms/AuthForgotPassword";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Şifremi Unuttum — psikosun" };

const ForgotPasswordPage = () => {
  return (
    <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
      <div className="flex h-full justify-center items-center px-4">
        <CardBox className="md:w-[420px] w-full border-none">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight">psikosun</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Şifre sıfırlama</p>
          </div>
          <AuthForgotPassword />
        </CardBox>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
