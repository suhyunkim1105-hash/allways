"use client";
// Layout / header — owner 수현. Matches Figma "03 지도리스트" final header.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const TABS = [
  { href: "/map", label: "Home", match: (p: string) => p === "/map" || p.startsWith("/places") },
  { href: null, label: "Padlet", match: () => false },
  { href: null, label: "My", match: () => false },
];

export default function Header() {
  const path = usePathname() || "/";
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-surface">
      <div className="relative mx-auto flex h-16 max-w-[1440px] items-center px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="AllWays — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/allways-logo.png" alt="AllWays" className="h-8 w-auto" />
        </Link>

        <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-14 md:flex">
          {TABS.map((t) =>
            t.href ? (
              <Link
                key={t.label}
                href={t.href}
                aria-current={t.match(path) ? "page" : undefined}
                className={`relative py-5 text-[15px] transition-colors ${
                  t.match(path)
                    ? "font-bold text-brand after:absolute after:inset-x-0 after:bottom-3 after:h-0.5 after:rounded-full after:bg-brand after:content-['']"
                    : "text-ink hover:text-brand"
                }`}
              >
                {t.label}
              </Link>
            ) : (
              <span
                key={t.label}
                aria-disabled="true"
                title="Coming in the next release"
                className="cursor-not-allowed py-5 text-[15px] text-verdict-none"
              >
                {t.label}
              </span>
            )
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/guide" className="hidden text-[13px] text-muted underline-offset-2 hover:text-brand hover:underline lg:block">
            How we rate
          </Link>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(q.trim() ? `/places?q=${encodeURIComponent(q.trim())}` : "/places");
            }}
            className="flex h-9 w-[280px] items-center gap-2 rounded-full bg-canvas px-4 focus-within:ring-2 focus-within:ring-brand"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
              <circle cx="11" cy="11" r="7" stroke="#5B6470" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="#5B6470" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search destinations"
              placeholder="Search destinations..."
              className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
