import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

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
    "A responsive guitar chord library for organizing songs, imports, and play-along reader views.",
};

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/songs", label: "Songs" },
  { href: "/chords", label: "Chords" },
  { href: "/artists", label: "Artists" },
  { href: "/genres", label: "Genres" },
  { href: "/lists", label: "Lists" },
  { href: "/import", label: "Import" },
  { href: "/manage", label: "Manage" },
];

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
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <header className="rounded-3xl border border-white/10 bg-slate-900/85 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
                  Guitar chords
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Practice-ready song organization
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Responsive library views, import review, and a dedicated
                  reader mode for play-along sessions.
                </p>
              </div>

              <nav className="flex flex-wrap gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-300/40 hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1 py-8">{children}</main>

          <footer className="border-t border-white/10 py-6 text-sm text-slate-400">
            Built for a single-user MVP on Render with PostgreSQL, Prisma, and
            object storage for imported PDFs.
          </footer>
        </div>
      </body>
    </html>
  );
}
