"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  );
}

function ChordsIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="2" y="13" width="3.5" height="9" rx="0.75" />
      <rect x="7.5" y="8" width="3.5" height="14" rx="0.75" />
      <rect x="13" y="4" width="3.5" height="18" rx="0.75" />
      <rect x="18.5" y="10" width="3.5" height="12" rx="0.75" />
    </svg>
  );
}

const tabs = [
  { href: "/", label: "Home", Icon: HomeIcon, matchExact: true },
  { href: "/chords", label: "Chords", Icon: ChordsIcon, matchExact: false },
  { href: "/manage", label: "Library", Icon: LibraryIcon, matchExact: false },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="site-header border-b border-white/10 bg-[#0d1421]">
      <div className="mx-auto flex w-full max-w-2xl items-stretch">
        {tabs.map(({ href, label, Icon, matchExact }) => {
          const isActive = matchExact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 pb-3 pt-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
