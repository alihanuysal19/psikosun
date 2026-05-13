"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import SocialLinks from "@/app/components/shared/SocialLinks";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-dark/90 backdrop-blur-md border-b border-border dark:border-darkborder">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white ring-1 ring-primary/20 overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/branding/psikosun-icon-32.png" alt="psikosun" className="w-full h-full object-contain p-0.5" />
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

          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <Icon icon="tabler:arrow-left" width={16} />
            Ana Sayfa
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>

      <footer className="bg-white dark:bg-darkgray border-t border-border dark:border-darkborder mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Icon icon="tabler:copyright" width={12} />
              2026 PSIKOSUN. Tüm hakları saklıdır.
            </span>
            <span className="hidden sm:inline">•</span>
            <Link href="/kvkk" className="hover:text-primary transition-colors">KVKK</Link>
            <Link href="/gizlilik" className="hover:text-primary transition-colors">Gizlilik</Link>
            <Link href="/uyelik" className="hover:text-primary transition-colors">Üyelik</Link>
            <Link href="/mesafeli" className="hover:text-primary transition-colors">Mesafeli Satış</Link>
          </div>
          <SocialLinks size={16} />
        </div>
      </footer>
    </div>
  );
}
