"use client";
// Map screen. Stage 1 (pins + card) working; Stage 2 filter link + Stage 3 full route styling: owner 이령.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import VerdictBadge from "@/components/VerdictBadge";
import { getPlaces, getSegments, getSurvey, Place } from "@/lib/data";

const CAT_ICON: Record<string, string> = {
  "History & Heritage": "🏛️", "Arts & Culture": "🎨", "Nature & Leisure": "🌳", "Shopping & Entertainment": "🛍️",
};

export default function MapPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Place | null>(null);
  const [err, setErr] = useState(false);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  useEffect(() => {
    if (!key || !ref.current) return;
    const init = () => {
      const g = (window as any).google;
      const map = new g.maps.Map(ref.current, {
        center: { lat: 37.551, lng: 126.978 }, zoom: 13, mapId: "ALLWAYS",
        disableDefaultUI: true, zoomControl: true, language: "en",
      });
      getPlaces().forEach(p => {
        const marker = new g.maps.Marker({
          position: { lat: p.lat, lng: p.lng }, map,
          label: { text: CAT_ICON[p.category] ?? "📍", fontSize: "18px" },
          icon: { path: g.maps.SymbolPath.CIRCLE, scale: 16, fillColor: "#FFFFFF", fillOpacity: 0.95, strokeColor: "#0046FF", strokeWeight: 2 },
          title: p.name_en,
        });
        marker.addListener("click", () => setSel(p));
      });
      getSegments().forEach(s => {
        if (!s.path) return;
        new g.maps.Polyline({
          map, path: s.path.map(([lat, lng]) => ({ lat, lng })),
          strokeColor: s.verdict === "빨강" ? "#FF8040" : "#0046FF",
          strokeOpacity: 0.85, strokeWeight: 4,
        });
        if (s.hazard) new g.maps.Marker({
          map, position: { lat: s.hazard.lat, lng: s.hazard.lng },
          label: { text: "⚠️", fontSize: "14px" },
          icon: { path: g.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#FF8040", fillOpacity: 1, strokeColor: "#FFFFFF", strokeWeight: 2 },
          title: s.hazard.note,
        });
      });
    };
    if ((window as any).google?.maps) { init(); return; }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&language=en&region=KR`;
    s.async = true; s.onload = init; s.onerror = () => setErr(true);
    document.head.appendChild(s);
  }, [key]);

  if (!key || err) return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Map unavailable</h1>
      <p className="mt-2 text-muted">{!key ? "Google Maps key not configured (NEXT_PUBLIC_GOOGLE_MAPS_KEY)." : "The map failed to load."} Browse places from the list instead.</p>
      <Link href="/places" className="mt-6 inline-block rounded-full bg-brand px-8 py-3 font-bold text-white">Open list</Link>
    </div>
  );

  return (
    <div className="relative">
      <div ref={ref} className="h-[calc(100vh-3.5rem)] w-full" />
      {sel && (
        <div className="absolute bottom-6 left-1/2 w-[min(92%,28rem)] -translate-x-1/2 rounded-xl border border-line bg-surface p-4 shadow-lg">
          <button onClick={() => setSel(null)} aria-label="Close" className="absolute right-3 top-2 text-muted">✕</button>
          <h2 className="pr-6 font-bold">{sel.name_en}</h2>
          <p className="text-xs text-muted">{sel.name_ko}</p>
          <div className="mt-2"><VerdictBadge verdict={getSurvey(sel.place_id)?.verdict || "정보없음"} size="sm" /></div>
          <Link href={`/places/${sel.place_id}`} className="mt-3 inline-block text-sm font-bold text-brand">See details →</Link>
        </div>
      )}
    </div>
  );
}
