import React from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./css/globals.css";
import { ThemeModeScript, ThemeProvider } from "flowbite-react";
import customTheme from "@/utils/theme/custom-theme";
import { CustomizerContextProvider } from "@/app/context/customizerContext";
import "../utils/i18n";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "../app/context/AuthContext";
import Script from "next/script";

// Marka yazı tipleri — psikosun teması için seçildi:
//  Gövde: Plus Jakarta Sans (sıcak, profesyonel, yüksek okunabilirlik)
//  Başlık: Space Grotesk (modern, hafif teknik, brand gradient'iyle uyumlu)
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});
const grotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PSIKOSUN",
    template: "%s | PSIKOSUN",
  },
  description:
    "PSIKOSUN — PDR temelli online rehberlik ve danışmanlık platformu. Akademik hedefler ve psikolojik dayanıklılığı birlikte destekler.",
  applicationName: "PSIKOSUN",
  icons: {
    // Yeni marka iconu - alpha kanali tasiyan PNG seti + multi-size .ico
    icon: [
      { url: "/branding/favicon.ico", sizes: "any" },
      { url: "/branding/psikosun-icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/branding/psikosun-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/branding/psikosun-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/branding/favicon.ico",
    apple: "/branding/psikosun-icon-180.png",
  },
  openGraph: {
    title: "PSIKOSUN",
    description: "PDR temelli online rehberlik ve danışmanlık platformu",
    url: "https://psikosun.com",
    siteName: "PSIKOSUN",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PSIKOSUN",
    description: "PDR temelli online rehberlik ve danışmanlık platformu",
  },
};

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <ThemeModeScript />
        {/* Landing kritik asset'lerini hero paint'i beklerken arka planda
            indir — SSR HTML'de sayfa tipi bilinmediği için preload hint
            browser'a düşer ama page.tsx mount'unda kesin kullanılıyor. */}
        <link
          rel="preload"
          href="/branding/psikosun-wordmark-480.png"
          as="image"
          type="image/png"
        />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className={`${jakarta.variable} ${grotesk.variable} font-body`}>
        <NextTopLoader />
        <ThemeProvider theme={customTheme}>
          <AuthProvider>
            <CustomizerContextProvider>{children}</CustomizerContextProvider>
          </AuthProvider>
        </ThemeProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-B4G9JDWNZP"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-B4G9JDWNZP');
        `}</Script>
      </body>
    </html>
  );
}
