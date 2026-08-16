"use client";
// Shared Google Map. Used by the route screen and by every place detail page,
// so the map behaves identically everywhere and the API script loads once.
import { useEffect, useRef } from "react";
import { MAP_STYLE, VERDICT_HEX, CAT_ICON, pinIcon } from "@/lib/mapStyle";

export type MapPin = {
  id: string; lat: number; lng: number; name: string; verdict: string; category: string;
};
export type MapLine = {
  id: string; path: [number, number][]; verdict: string; label: string;
  hazard?: { lat: number; lng: number; note: string } | null;
};

let loader: Promise<any> | null = null;
function loadMaps(key: string): Promise<any> {
  if (typeof window === "undefined") return Promise.reject();
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&language=en&region=KR`;
    s.async = true;
    s.onload = () => resolve((window as any).google);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return loader;
}

export default function MapCanvas({
  pins, lines = [], activePinId = null, activeLineId = null, onPinClick, className = "",
}: {
  pins: MapPin[];
  lines?: MapLine[];
  activePinId?: string | null;
  activeLineId?: string | null;
  onPinClick?: (id: string) => void;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});
  const polys = useRef<Record<string, any>>({});
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  // Build the map once.
  useEffect(() => {
    if (!key || !host.current) return;
    let dead = false;
    loadMaps(key).then((g) => {
      if (dead || !host.current) return;
      map.current = new g.maps.Map(host.current, {
        center: { lat: 37.5525, lng: 126.9785 },
        zoom: 13,
        styles: MAP_STYLE,          // ← only applied because no mapId is set
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        gestureHandling: "greedy",
      });

      lines.forEach((l) => {
        if (!l.path?.length) return;
        polys.current[l.id] = new g.maps.Polyline({
          map: map.current,
          path: l.path.map(([lat, lng]) => ({ lat, lng })),
          strokeColor: l.verdict === "빨강" ? VERDICT_HEX["빨강"] : "#0046FF",
          strokeOpacity: 0.9,
          strokeWeight: 5,
          zIndex: 10,
        });
        if (l.hazard) {
          new g.maps.Marker({
            map: map.current,
            position: { lat: l.hazard.lat, lng: l.hazard.lng },
            title: `Caution: ${l.hazard.note}`,
            label: { text: "!", color: "#FFFFFF", fontSize: "13px", fontWeight: "700" },
            icon: {
              path: g.maps.SymbolPath.CIRCLE, scale: 9,
              fillColor: "#FF8040", fillOpacity: 1, strokeColor: "#FFFFFF", strokeWeight: 2,
            },
            zIndex: 20,
          });
        }
      });

      pins.forEach((p) => {
        const m = new g.maps.Marker({
          map: map.current,
          position: { lat: p.lat, lng: p.lng },
          icon: pinIcon(g, p.verdict),
          label: { text: CAT_ICON[p.category] ?? "•", fontSize: "15px" },
          title: p.name,
          zIndex: 30,
        });
        m.addListener("click", () => onPinClick?.(p.id));
        markers.current[p.id] = m;
      });

      // Frame everything we drew.
      const b = new g.maps.LatLngBounds();
      pins.forEach((p) => b.extend({ lat: p.lat, lng: p.lng }));
      lines.forEach((l) => l.path?.forEach(([lat, lng]) => b.extend({ lat, lng })));
      if (!b.isEmpty()) map.current.fitBounds(b, { top: 64, right: 64, bottom: 64, left: 64 });
    });
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Highlight the selected route; dim the rest.
  useEffect(() => {
    const g = (window as any).google;
    if (!g || !map.current) return;
    Object.entries(polys.current).forEach(([id, p]) => {
      const on = !activeLineId || id === activeLineId;
      p.setOptions({ strokeOpacity: on ? 0.95 : 0.18, strokeWeight: id === activeLineId ? 7 : 5 });
    });
    const line = lines.find((l) => l.id === activeLineId);
    if (line?.path?.length) {
      const b = new g.maps.LatLngBounds();
      line.path.forEach(([lat, lng]) => b.extend({ lat, lng }));
      map.current.fitBounds(b, { top: 80, right: 80, bottom: 80, left: 80 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLineId]);

  // Enlarge the selected pin.
  useEffect(() => {
    const g = (window as any).google;
    if (!g) return;
    pins.forEach((p) => {
      const m = markers.current[p.id];
      if (m) m.setIcon(pinIcon(g, p.verdict, p.id === activePinId));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePinId]);

  if (!key) {
    return (
      <div
        className={`flex items-center justify-center bg-canvas ${className}`}
        style={{
          backgroundImage:
            "linear-gradient(#E3E6EA 1px, transparent 1px), linear-gradient(90deg, #E3E6EA 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div className="max-w-sm rounded-2xl border border-line bg-surface px-7 py-6 text-center shadow-sm">
          <p className="text-[15px] font-bold text-ink">Map is loading soon</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
            The map key has not been added to this deployment yet. Every route, measurement
            and photo is already available from the panel on the left.
          </p>
        </div>
      </div>
    );
  }
  return <div ref={host} className={className} role="application" aria-label="Map of surveyed places and routes" />;
}
