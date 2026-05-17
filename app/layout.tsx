import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { NavTabs } from "@/components/nav-tabs";

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
  title: "Guitar Chords Library",
  description:
    "A responsive guitar chord library for organizing songs and play-along reader views.",
  icons: {
    apple: "/guitar-chords-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100">
        <div
          className="site-shell mx-auto flex min-h-screen w-full max-w-2xl flex-col"
          style={{ minHeight: "100dvh" }}
        >
          <NavTabs />
          <main className="site-main flex-1 px-4 py-4 sm:px-6 sm:py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
