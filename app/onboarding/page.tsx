"use client";
// Owner: 이령 — mobility-profile selection. Her version replaces this scaffold.
import Link from "next/link";
import { useState } from "react";

const OPTIONS = [
  { id: "wheelchair", label: "Wheelchair user", icon: "♿" },
  { id: "stroller", label: "Stroller", icon: "👶" },
  { id: "senior", label: "Senior", icon: "🧓" },
  { id: "pregnant", label: "Pregnant", icon: "🤰" },
  { id: "hearing", label: "Hearing impaired", icon: "🦻" },
];

export default function Onboarding() {
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (id: string) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Tell us about your journey</h1>
      <p className="mt-2 text-muted">Select all that apply — or skip.</p>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {OPTIONS.map(o => (
          <button key={o.id} onClick={() => toggle(o.id)} aria-pressed={sel.includes(o.id)}
            className={`rounded-xl border-2 p-6 text-lg font-bold transition-colors ${sel.includes(o.id) ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand"}`}>
            <span aria-hidden="true" className="block text-3xl">{o.icon}</span>{o.label}
          </button>
        ))}
      </div>
      <div className="mt-10 flex justify-center gap-4">
        <Link href="/places" className="rounded-full px-8 py-3 text-muted hover:text-ink">Skip</Link>
        <Link href="/places" className="rounded-full bg-brand px-8 py-3 font-bold text-white hover:bg-brand/90">Continue</Link>
      </div>
    </div>
  );
}
