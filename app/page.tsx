"use client";
// Owner: 명진 — first screen. His LandingPage component (Myoungjin branch) replaces this at merge.
import Link from "next/link";
import { useEffect, useState } from "react";

const GREETINGS = ["Welcome", "환영합니다", "ようこそ", "欢迎", "Bienvenue", "Willkommen", "Bienvenido", "Benvenuto", "Chào mừng", "ยินดีต้อนรับ"];

export default function Landing() {
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;
    const t = setInterval(() => setI(v => (v + 1) % GREETINGS.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-brand px-4 text-center text-white">
      <p className="mb-6 h-10 text-3xl font-bold" aria-live="polite">{reduced ? "Welcome" : GREETINGS[i]}</p>
      <h1 className="text-6xl font-bold tracking-tight">
        <span className="text-accent">All</span>Ways
      </h1>
      <p className="mt-4 text-xl text-white/90">Every path, for everyone.</p>
      <p className="mt-2 max-w-xl text-white/70">
        On-site surveyed accessibility for Seoul&apos;s Gwanghwamun &amp; Yongsan — measured by us, step by step.
      </p>
      <Link href="/onboarding"
        className="mt-10 rounded-full bg-white px-10 py-4 text-lg font-bold text-brand hover:bg-white/90 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white/60">
        Explore
      </Link>
    </div>
  );
}
