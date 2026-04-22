import React from "react";
import type { Metadata, Viewport } from "next";
import { Rajdhani, Orbitron } from "next/font/google";
import "./css/globals.css";
import { ThemeModeScript, ThemeProvider } from "flowbite-react";
import customTheme from "@/utils/theme/custom-theme";
import { CustomizerContextProvider } from "@/app/context/customizerContext";
import "../utils/i18n";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "../app/context/AuthContext";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
});
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-orbitron",
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
    // Beyaz arka planlı SVG (tercih edilir) + logo.png fallback (Safari eski sürümler için)
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/landing/images/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/landing/images/logo.png",
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
          href="/landing/images/logo.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/landing/prism-flux.css"
          as="style"
        />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className={`${rajdhani.variable} ${orbitron.variable} font-body`}>
        <NextTopLoader />
        <ThemeProvider theme={customTheme}>
          <AuthProvider>
            <CustomizerContextProvider>{children}</CustomizerContextProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
