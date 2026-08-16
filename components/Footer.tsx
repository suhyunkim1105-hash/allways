"use client";
// Owner: 명진. Hidden on the two full-height map screens so the map can reach the viewport edge.
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const path = usePathname() || "/";
  if (path === "/map" || /^\/places\/[^/]+$/.test(path)) return null;

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1440px] px-6 py-7 text-[12.5px] text-muted">
        <p className="font-bold text-ink">Team Ctrl+K · 2026 KF Digital Public Diplomacy Academy</p>
        <p className="mt-1">
          Every accessibility figure on this site was measured on site by our team between
          10 and 15 August 2026. Conditions on the ground can change.
        </p>
        <p className="mt-2">
          <Link href="/guide" className="font-bold text-brand hover:underline">How we rate accessibility</Link>
        </p>
      </div>
    </footer>
  );
}
