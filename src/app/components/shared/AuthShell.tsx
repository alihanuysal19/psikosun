"use client";
import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const AuthShell = ({ title, subtitle, children, footer }: Props) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Aurora background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(124,58,237,0.18), transparent 45%)," +
            "radial-gradient(circle at 85% 75%, rgba(0,188,212,0.14), transparent 45%)," +
            "linear-gradient(135deg,#ffffff 0%,#f4f7fb 35%,#eef3f9 70%,#ffffff 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 3px)," +
            "repeating-linear-gradient(90deg,transparent,transparent 2px,#000 2px,#000 3px)",
        }}
      />

      {/* Ana sayfa dönüş butonu — mobilde ve masaüstünde üst köşede */}
      <Link
        href="/"
        className="fixed top-3 left-3 sm:top-5 sm:left-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary shadow-sm hover:bg-white transition-colors"
      >
        <Icon icon="tabler:arrow-left" width={14} />
        Ana Sayfa
      </Link>

      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px]">
          {/* Prism brand — logo tıklanabilir, ana sayfaya gider */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <Link href="/" className="relative w-20 h-20 group" aria-label="Ana sayfaya git">
              <div
                className="absolute inset-0 rounded-2xl transition-transform group-hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg,#7c3aed 0%,#9333ea 50%,#00bcd4 100%)",
                  boxShadow: "0 14px 44px -12px rgba(124,58,237,0.55)",
                }}
              />
              <div className="absolute inset-[3px] rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                <img
                  src="/landing/images/logo.png"
                  alt="psikosun"
                  className="w-full h-full object-contain p-2"
                />
              </div>
            </Link>
            <div className="text-center">
              <Link
                href="/"
                className="inline-block text-2xl font-black tracking-[0.12em] hover:opacity-80 transition-opacity"
                style={{
                  fontFamily: "var(--font-grotesk),'Space Grotesk',system-ui,sans-serif",
                  background:
                    "linear-gradient(90deg,#7c3aed,#00bcd4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                PSIKOSUN
              </Link>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mt-1">
                {title}
              </p>
            </div>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-7 backdrop-blur-sm"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(124,58,237,0.18)",
              boxShadow:
                "0 30px 80px -30px rgba(124,58,237,0.35), 0 1px 0 rgba(255,255,255,0.7) inset",
            }}
          >
            {subtitle && (
              <p className="text-sm text-center text-gray-500 mb-6">
                {subtitle}
              </p>
            )}
            {children}
          </div>

          {footer && (
            <div className="text-center mt-6 text-sm text-gray-500">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
