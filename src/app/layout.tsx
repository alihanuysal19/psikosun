import React from "react";
import type { Metadata } from "next";
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
  title: "psikosun",
  description: "psikosun — online eğitim platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <ThemeModeScript />
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
