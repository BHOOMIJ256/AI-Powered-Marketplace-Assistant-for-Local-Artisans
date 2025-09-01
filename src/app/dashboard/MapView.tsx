"use client";

import { useEffect, useRef, useState } from "react";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let map: any;
    let markers: any[] = [];

    function ensureLeaflet(): Promise<any> {
      return new Promise((resolve, reject) => {
        // Add CSS if not present
        const cssHref = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        if (!document.querySelector(`link[href='${cssHref}']`)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = cssHref;
          document.head.appendChild(link);
        }
        // Add JS if not present
        const jsSrc = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        if ((window as any).L) return resolve((window as any).L);
        const script = document.createElement("script");
        script.src = jsSrc;
        script.async = true;
        script.onload = () => resolve((window as any).L);
        script.onerror = () => reject(new Error("Failed to load Leaflet"));
        document.body.appendChild(script);
      });
    }

    async function init() {
      try {
        const L = await ensureLeaflet();
        if (!mapRef.current) return;
        map = L.map(mapRef.current).setView([22.9734, 78.6569], 4.5); // India center
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const res = await fetch('/api/insights/locations');
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || 'Failed to load locations');

        markers = data.data.map((pt: any) => L.marker([pt.lat, pt.lng]).bindPopup(`${pt.count} orders`)).map((m: any) => m.addTo(map));
      } catch (e: any) {
        setError(e.message || 'Failed to init map');
      }
    }

    init();
    return () => {
      markers.forEach(m => { try { m.remove(); } catch {} });
      try { (map as any)?.remove(); } catch {}
    };
  }, []);

  return (
    <div className="relative">
      {error && <div className="absolute inset-0 flex items-center justify-center text-sm text-red-600">{error}</div>}
      <div ref={mapRef} className="w-full h-48 rounded overflow-hidden" />
    </div>
  );
}
