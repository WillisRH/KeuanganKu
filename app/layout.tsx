import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://expense-tracker-tau-bay-22.vercel.app'),
  // metadataBase: new URL('http://localhost:3000'),
  title: "Keuanganku | Smart AI Expense Tracker",
  description: "Kelola keuanganmu dengan cerdas menggunakan asisten AI Gemini.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

import Providers from "./providers";
import TopLoader from "./TopLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
