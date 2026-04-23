"use client";
import { ReactNode, useContext } from "react";
import Link from "next/link";
import { Bounce, ToastContainer } from "react-toastify";
import { Icon } from "@iconify/react";
import AuthContext from "@/app/context/AuthContext";
import SocialLinks from "@/app/components/shared/SocialLinks";

export default function KesfetLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isInitialized } = useContext(AuthContext) as any;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-dark/90 backdrop-blur-md border-b border-border dark:border-darkborder">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white ring-1 ring-primary/20 overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/landing/images/logo.png" alt="psikosun" className="w-full h-full object-contain p-0.5" />
            </div>
            <span
              className="font-black tracking-[0.12em] text-base hidden sm:inline"
              style={{
                fontFamily: "var(--font-grotesk),'Space Grotesk',system-ui,sans-serif",
                background: "linear-gradient(90deg,#7c3aed,#00bcd4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PSIKOSUN
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary px-3 py-1.5 rounded-lg transition-colors"
            >
              Ana Sayfa
            </Link>
            <Link
              href="/kesfet"
              className="text-sm font-medium text-primary px-3 py-1.5 rounded-lg bg-primary/5"
            >
              Keşfet
            </Link>
            {isInitialized && isAuthenticated && user ? (
              <Link
                href="/panel"
                className="text-sm text-white px-4 py-1.5 rounded-full font-medium"
                style={{ background: "linear-gradient(135deg,#7c3aed,#00bcd4)" }}
              >
                Panel
              </Link>
            ) : isInitialized ? (
              <Link
                href="/auth/login"
                className="text-sm text-primary border border-primary/30 px-4 py-1.5 rounded-full font-medium hover:bg-primary/5"
              >
                Giriş
              </Link>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>

      <footer className="bg-white dark:bg-darkgray border-t border-border dark:border-darkborder mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Icon icon="tabler:copyright" width={12} />
            <span>2026 PSIKOSUN. Tüm hakları saklıdır.</span>
          </div>
          <SocialLinks size={16} />
        </div>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        closeOnClick
        theme="light"
        transition={Bounce}
      />
    </div>
  );
}
