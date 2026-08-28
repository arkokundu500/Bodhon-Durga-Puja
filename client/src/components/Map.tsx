// Bodhon visual reminder: the live map should feel like a reliable travel instrument layered over a warm Bengal field; never load Google Maps more than once.
/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const FORGE_BASE_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
const USE_DIRECT_GOOGLE_MAPS = import.meta.env.VITE_GOOGLE_MAPS_USE_DIRECT === "true" && Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
const API_KEY = USE_DIRECT_GOOGLE_MAPS ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY : import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const MAPS_SCRIPT_BASE = USE_DIRECT_GOOGLE_MAPS ? "https://maps.googleapis.com/maps/api/js" : `${FORGE_BASE_URL}/v1/maps/proxy/maps/api/js`;
const MAPS_SCRIPT_ID = "bodhon-google-maps-js";
let mapsScriptPromise: Promise<typeof google> | null = null;

function loadMapScript(): Promise<typeof google> {
  if (typeof window !== "undefined" && window.google?.maps) return Promise.resolve(window.google);
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise<typeof google>((resolve, reject) => {
    const existingScript = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    const handleLoad = () => {
      if (window.google?.maps) resolve(window.google);
      else reject(new Error("Google Maps loaded without the Maps namespace."));
    };
    const handleError = () => reject(new Error("Google Maps could not be loaded."));

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.src = `${MAPS_SCRIPT_BASE}?key=${encodeURIComponent(API_KEY)}&v=weekly&loading=async&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    mapsScriptPromise = null;
    throw error;
  });

  return mapsScriptPromise;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
  onMapError?: (error: Error) => void;
}

type MapStatus = "loading" | "ready" | "error";

export function MapView({
  className,
  initialCenter = { lat: 22.5726, lng: 88.3639 },
  initialZoom = 11,
  onMapReady,
  onMapError,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const onMapReadyRef = useRef(onMapReady);
  const onMapErrorRef = useRef(onMapError);
  const [status, setStatus] = useState<MapStatus>("loading");

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
    onMapErrorRef.current = onMapError;
  }, [onMapReady, onMapError]);

  const initialCenterRef = useRef(initialCenter);
  const initialZoomRef = useRef(initialZoom);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    loadMapScript()
      .then((maps) => {
        const createMap = (attempt = 0) => {
          if (cancelled || !mapContainer.current || !maps.maps) return;
          try {
            const createdMap = new maps.maps.Map(mapContainer.current, {
              zoom: initialZoomRef.current,
              center: initialCenterRef.current,
              mapTypeControl: true,
              fullscreenControl: true,
              streetViewControl: false,
              zoomControl: true,
              gestureHandling: "greedy",
              mapTypeId: "roadmap",
              mapId: "DEMO_MAP_ID",
            });
            map.current = createdMap;
            setStatus("ready");
            try {
              onMapReadyRef.current?.(createdMap);
            } catch (error) {
              // The map itself is usable even if a custom marker callback fails.
              // Keep the live SDK surface visible rather than switching to fallback.
              console.error("[Bodhon] map marker callback failed", error);
            }
          } catch (error) {
            if (attempt < 4) {
              window.setTimeout(() => createMap(attempt + 1), 120);
              return;
            }
            const mapError = error instanceof Error ? error : new Error(String(error));
            setStatus("error");
            onMapErrorRef.current?.(mapError);
          }
        };

        createMap();
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setStatus("error");
        onMapErrorRef.current?.(error);
      });

    return () => {
      cancelled = true;
      map.current = null;
    };
  }, []);

  return (
    <div className={cn("relative h-[500px] w-full overflow-hidden", className)} aria-label="Google Maps pandal guide">
      <div ref={mapContainer} className="h-full w-full" />
      {status === "loading" && <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#B52A22]/12 bg-[#FFF9EF]/92 px-3 py-2 text-xs font-bold text-[#6B574C] shadow-md backdrop-blur-sm"><Loader2 size={14} className="animate-spin text-[#B52A22]" /> Loading live map…</div>}
      {status === "error" && <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#B52A22]/18 bg-[#FFF9EF]/94 px-3 py-2 text-xs font-bold text-[#B52A22] shadow-md backdrop-blur-sm"><AlertTriangle size={14} /> Illustrated map mode</div>}
    </div>
  );
}
