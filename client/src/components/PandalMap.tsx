import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BusFront, ChevronLeft, ChevronRight, ExternalLink, ListFilter, LocateFixed, Map as MapIcon, MapPin, Route, Search, TrainFront, X } from "lucide-react";
import { MapView } from "@/components/Map";
import { BUS_STOPS, METRO_STATIONS, PANDALS, type Pandal, type TransitPoint, useBodhonStore } from "@/lib/bodhon-data";
import { aStarRoute } from "@/lib/a-star";
import { getCurrentCoordinates, startLocationTracking, type Coordinates } from "@/lib/location";
import { getMapMarkerLayerState } from "@/lib/map-marker-state";
import { trpc } from "@/lib/trpc";

const PAGE_SIZE = 10;

function distanceBetween(a: Coordinates, b: Coordinates) {
  const radius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function nearestPoint(destination: Coordinates, points: TransitPoint[]) {
  return points.reduce<TransitPoint | null>((nearest, point) => !nearest || distanceBetween(destination, point) < distanceBetween(destination, nearest) ? point : nearest, null);
}

function projectToFallback(point: Coordinates) {
  const minLat = 22.42;
  const maxLat = 22.78;
  const minLng = 88.18;
  const maxLng = 88.48;
  return {
    left: Math.min(92, Math.max(8, ((point.lng - minLng) / (maxLng - minLng)) * 100)),
    top: Math.min(88, Math.max(12, (1 - (point.lat - minLat) / (maxLat - minLat)) * 100)),
  };
}

/**
 * Generates Google Maps transit directions URL with origin set to "My Location" or GPS coordinates
 */
export const directionsFor = (pandal: Pandal, origin?: Coordinates | null) => {
  const originPart = origin ? `${origin.lat},${origin.lng}` : "My+Location";
  return `https://www.google.com/maps/dir/?api=1&origin=${originPart}&destination=${pandal.lat},${pandal.lng}&travelmode=transit`;
};

export function PandalMap({ showMap = true }: { showMap?: boolean }) {
  const { selectedPandalId, setSelectedPandal } = useBodhonStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);
  const [mapSdkReady, setMapSdkReady] = useState(false);
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");

  const mapRef = useRef<google.maps.Map | null>(null);
  const pandalMarkersRef = useRef<google.maps.Marker[]>([]);
  const specialMarkersRef = useRef<google.maps.Marker[]>([]);
  const locationTrackerRef = useRef<ReturnType<typeof startLocationTracking>>(null);

  // Debounce search query to prevent micro re-renders while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filter pandals by search term
  const filteredPandals = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();
    if (!query) return PANDALS;
    return PANDALS.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }, [debouncedQuery]);

  // Sort by distance if user location is available
  const visiblePandals = useMemo(() => {
    if (!userPosition) return filteredPandals;
    return [...filteredPandals].sort((a, b) => distanceBetween(userPosition, a) - distanceBetween(userPosition, b));
  }, [filteredPandals, userPosition]);

  const selectedPandal = useMemo(() => {
    const found = visiblePandals.find((pandal) => pandal.id === selectedPandalId);
    return found ?? visiblePandals[0] ?? PANDALS[0];
  }, [visiblePandals, selectedPandalId]);

  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: selectedPandal.lat, lng: selectedPandal.lng });

  const pageCount = Math.max(1, Math.ceil(visiblePandals.length / PAGE_SIZE));
  const pagePandals = visiblePandals.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const metro = useMemo(() => nearestPoint(selectedPandal, METRO_STATIONS), [selectedPandal]);
  const bus = useMemo(() => nearestPoint(selectedPandal, BUS_STOPS), [selectedPandal]);
  const routeInput = useMemo(() => userPosition ? { originLat: userPosition.lat, originLng: userPosition.lng, destinationLat: selectedPandal.lat, destinationLng: selectedPandal.lng } : undefined, [userPosition, selectedPandal.lat, selectedPandal.lng]);
  const routeQuery = trpc.guide.route.useQuery(routeInput as { originLat: number; originLng: number; destinationLat: number; destinationLng: number }, { enabled: Boolean(routeInput), retry: false, staleTime: 120_000 });
  const astar = useMemo(() => userPosition && routeQuery.data?.route ? aStarRoute({ id: "user", ...userPosition }, { id: selectedPandal.id, lat: selectedPandal.lat, lng: selectedPandal.lng }, routeQuery.data.route.steps) : null, [userPosition, selectedPandal, routeQuery.data?.route]);

  // Stable redraw of special markers (selected pandal, nearest metro, nearest bus, user location)
  const updateSpecialMarkers = useCallback((map: google.maps.Map, pandal: Pandal, user: Coordinates | null) => {
    specialMarkersRef.current.forEach((m) => m.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    const nearestMetro = nearestPoint(pandal, METRO_STATIONS);
    const nearestBus = nearestPoint(pandal, BUS_STOPS);

    if (nearestMetro) {
      newMarkers.push(new google.maps.Marker({
        map,
        position: { lat: nearestMetro.lat, lng: nearestMetro.lng },
        title: `Nearest metro: ${nearestMetro.name}`,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: "#2563EB", fillOpacity: 1, strokeColor: "#FFF9EF", strokeWeight: 2 },
        zIndex: 120,
      }));
    }

    if (nearestBus) {
      newMarkers.push(new google.maps.Marker({
        map,
        position: { lat: nearestBus.lat, lng: nearestBus.lng },
        title: `Nearest bus stop: ${nearestBus.name}`,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: "#18804B", fillOpacity: 1, strokeColor: "#FFF9EF", strokeWeight: 2 },
        zIndex: 120,
      }));
    }

    // Selected pandal pin
    newMarkers.push(new google.maps.Marker({
      map,
      position: { lat: pandal.lat, lng: pandal.lng },
      title: `Selected: ${pandal.name}`,
      icon: { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 7, fillColor: "#C62828", fillOpacity: 1, strokeColor: "#FFF9EF", strokeWeight: 2 },
      zIndex: 200,
    }));

    // Live user location pin
    if (user) {
      newMarkers.push(new google.maps.Marker({
        map,
        position: user,
        title: "Your live location",
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#10B981", fillOpacity: 1, strokeColor: "#FFFFFF", strokeWeight: 3 },
        zIndex: 210,
      }));
    }

    specialMarkersRef.current = newMarkers;
  }, []);

  // Base pandal dots (re-drawn only when filtered list changes)
  const redrawPandalMarkers = useCallback((map: google.maps.Map, list: Pandal[]) => {
    pandalMarkersRef.current.forEach((m) => m.setMap(null));
    const dots = list.slice(0, 100).map((pandal) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: pandal.lat, lng: pandal.lng },
        title: pandal.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 4,
          fillColor: "#E5A62C",
          fillOpacity: 0.9,
          strokeColor: "#FFF9EF",
          strokeWeight: 1.5,
        },
        zIndex: 10,
      });
      marker.addListener("click", () => {
        setSelectedPandal(pandal.id);
      });
      return marker;
    });
    pandalMarkersRef.current = dots;
  }, [setSelectedPandal]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapSdkReady(true);
    redrawPandalMarkers(map, visiblePandals);
    updateSpecialMarkers(map, selectedPandal, userPosition);
  }, [visiblePandals, selectedPandal, userPosition, redrawPandalMarkers, updateSpecialMarkers]);

  // When filtered pandals list changes, update dots
  useEffect(() => {
    if (!mapRef.current) return;
    redrawPandalMarkers(mapRef.current, visiblePandals);
  }, [visiblePandals, redrawPandalMarkers]);

  // When selected pandal or user position changes, update only special pins & pan smoothly
  useEffect(() => {
    if (!mapRef.current || !selectedPandal) return;
    updateSpecialMarkers(mapRef.current, selectedPandal, userPosition);
    mapRef.current.panTo({ lat: selectedPandal.lat, lng: selectedPandal.lng });
  }, [selectedPandal, userPosition, updateSpecialMarkers]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, userPosition]);

  useEffect(() => {
    return () => {
      locationTrackerRef.current?.stop();
    };
  }, []);

  const locateMe = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const coords = await getCurrentCoordinates(navigator.geolocation);
      setUserPosition(coords);
      setMapCenter(coords);
      setLocated(true);
      mapRef.current?.panTo(coords);
      mapRef.current?.setZoom(13);

      // Start gentle background watcher
      locationTrackerRef.current?.stop();
      locationTrackerRef.current = startLocationTracking(
        navigator.geolocation,
        (pos) => {
          setUserPosition(pos);
          setLocated(true);
        },
        (err) => {
          console.warn("[Location] Watcher error", err);
        },
        25 // 25 meter threshold to prevent jitter
      );
    } catch (err) {
      console.warn("[Location] Geolocation request denied or timed out", err);
      setLocated(false);
    } finally {
      setLocating(false);
    }
  };

  const choosePandal = (pandal: Pandal) => {
    setSelectedPandal(pandal.id);
    setMapCenter({ lat: pandal.lat, lng: pandal.lng });
    mapRef.current?.panTo({ lat: pandal.lat, lng: pandal.lng });
  };

  const clearSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery("");
  };

  const selectedFallbackPosition = selectedPandal ? projectToFallback(selectedPandal) : null;
  const userFallbackPosition = userPosition ? projectToFallback(userPosition) : null;
  const metroFallbackPosition = metro ? projectToFallback(metro) : null;
  const busFallbackPosition = bus ? projectToFallback(bus) : null;
  const markerLayerState = getMapMarkerLayerState(mapSdkReady, Boolean(userPosition));
  const localMetroDistance = (selectedPandal && metro) ? distanceBetween(selectedPandal, metro) : null;
  const localBusDistance = (selectedPandal && bus) ? distanceBetween(selectedPandal, bus) : null;
  const liveMetro = routeQuery.data?.metro;
  const liveBus = routeQuery.data?.bus;

  return (
    <div className="overflow-hidden rounded-[24px] sm:rounded-[36px] border border-[#B52A22]/12 bg-[#EEE1CD] shadow-[0_24px_80px_rgba(91,47,28,0.12)]">
      {/* Mobile Top View Switcher (Only shown on mobile when showMap is true) */}
      {showMap && (
        <div className="flex border-b border-[#B52A22]/12 bg-[#FFF9EF] p-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("map")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition-all ${
              mobileTab === "map"
                ? "bg-[#B52A22] text-[#FFF9EF] shadow-sm"
                : "text-[#80675A] hover:bg-[#B52A22]/8"
            }`}
          >
            <MapIcon size={14} /> ম্যাপ ভিউ (Map)
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition-all ${
              mobileTab === "list"
                ? "bg-[#B52A22] text-[#FFF9EF] shadow-sm"
                : "text-[#80675A] hover:bg-[#B52A22]/8"
            }`}
          >
            <ListFilter size={14} /> মণ্ডপ তালিকা (List)
          </button>
        </div>
      )}

      <div className={`grid ${showMap ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}>
        {/* MAP PANEL */}
        {showMap && (
          <div
            className={`relative min-h-[400px] sm:min-h-[480px] lg:min-h-[640px] overflow-hidden bg-[#DDE2C8] ${
              mobileTab === "map" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Fallback Illustrated Canvas */}
            <div className={`absolute inset-0 z-0 overflow-hidden bg-[#DDE2C8] transition-opacity duration-300 ${mapSdkReady ? "opacity-0" : "opacity-100"}`} aria-label="Bodhon own-built map fallback">
              <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(24deg,transparent_0_43%,rgba(255,249,239,0.92)_44%_45%,transparent_46%_100%),linear-gradient(108deg,transparent_0_38%,rgba(255,249,239,0.74)_39%_40%,transparent_41%_100%),linear-gradient(90deg,rgba(116,145,112,0.18)_1px,transparent_1px),linear-gradient(rgba(116,145,112,0.18)_1px,transparent_1px)] [background-size:100% 100%,100% 100%,42px 42px,42px 42px]" />
              <div className="absolute -left-20 top-[30%] h-[90%] w-[44%] rotate-[18deg] rounded-[50%] bg-[#A7D7D5]/55 blur-[1px]" />
              <p className="absolute left-6 top-1/2 -rotate-90 text-[10px] font-bold uppercase tracking-[0.28em] text-[#356E77]/70">Kolkata guide map</p>
              <span className="absolute left-[28%] top-[19%] text-[10px] font-semibold text-[#687D64]">North Kolkata</span>
              <span className="absolute left-[55%] top-[66%] text-[10px] font-semibold text-[#687D64]">South Kolkata</span>
              {pagePandals.map((pandal) => {
                const point = projectToFallback(pandal);
                return <span key={`fallback-${pandal.id}`} title={pandal.name} className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E5A62C] ring-2 ring-[#FFF9EF]/80" style={{ left: `${point.left}%`, top: `${point.top}%` }} />;
              })}
              {metroFallbackPosition && <span title={metro?.name} className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563EB] ring-2 ring-[#FFF9EF]" style={{ left: `${metroFallbackPosition.left}%`, top: `${metroFallbackPosition.top}%` }} />}
              {busFallbackPosition && <span title={bus?.name} className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#18804B] ring-2 ring-[#FFF9EF]" style={{ left: `${busFallbackPosition.left}%`, top: `${busFallbackPosition.top}%` }} />}
              {selectedFallbackPosition && markerLayerState.fallbackSelected && (
                <span title={`Selected: ${selectedPandal?.name}`} className="absolute z-10 -translate-x-1/2 -translate-y-full text-[#C62828] drop-shadow-[0_3px_4px_rgba(42,32,26,0.4)]" style={{ left: `${selectedFallbackPosition.left}%`, top: `${selectedFallbackPosition.top}%` }}>
                  <MapPin size={36} fill="#C62828" strokeWidth={1.7} />
                </span>
              )}
              <span className="absolute bottom-4 right-4 rounded-2xl border border-white/50 bg-[#FFF9EF]/86 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2A201A] shadow-lg">
                Own-built fallback
              </span>
            </div>

            {/* Direct Google Maps Canvas */}
            <MapView className="absolute inset-0 z-10 h-full w-full bg-transparent" initialCenter={mapCenter} initialZoom={12} onMapReady={handleMapReady} onMapError={() => { if (!mapRef.current) setMapSdkReady(false); }} />

            {/* Floating Info Pill */}
            <div className="absolute left-3 top-3 sm:left-4 sm:top-4 z-20 rounded-full border border-white/50 bg-[#FFF9EF]/92 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-[#2A201A] shadow-md backdrop-blur-sm">
              🔴 লাল পিন = নির্বাচিত মণ্ডপ
            </div>

            {/* Locate Me Button */}
            <button
              type="button"
              onClick={locateMe}
              disabled={locating}
              className="absolute bottom-4 left-3 sm:bottom-5 sm:left-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#FFF9EF] px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-[#2A201A] shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-75"
            >
              <LocateFixed size={14} className={located ? "text-[#10B981] animate-pulse" : locating ? "animate-spin text-[#B52A22]" : "text-[#80675A]"} />
              {locating ? "খোঁজা হচ্ছে..." : located ? "আপনার অবস্থান সক্রিয়" : "কাছের মণ্ডপ খুঁজুন"}
            </button>

          </div>
        )}

        {/* DIRECTORY & LIST PANEL */}
        <div
          className={`flex min-h-[500px] sm:min-h-[600px] flex-col bg-[#FFF9EF] p-4 sm:p-6 lg:p-7 ${
            showMap ? (mobileTab === "list" ? "block" : "hidden lg:flex") : "mx-auto w-full max-w-5xl"
          }`}
        >
          {/* Header section */}
          <div className="flex items-start justify-between gap-4 border-b border-[#B52A22]/10 pb-3 sm:pb-4">
            <div className="min-w-0 flex-1">
              <p className="section-kicker text-[#B52A22]">বোধন পথপ্রদর্শক</p>
              <h3 className="mt-1 font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-[#2A201A]">পূজা মণ্ডপ ডিরেক্টরি</h3>
            </div>
            <span className="alpona-ring grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-full border border-[#E5A62C]/70 text-[#B52A22]">
              <MapPin size={17} />
            </span>
          </div>

          {/* Smooth Search Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="relative flex items-center rounded-2xl border border-[#B52A22]/20 bg-[#F8F1E4] shadow-sm transition-all focus-within:border-[#B52A22] focus-within:ring-2 focus-within:ring-[#B52A22]/15">
              <Search size={16} className="ml-3 shrink-0 text-[#80675A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="মণ্ডপ বা এলাকা খুঁজুন (e.g. Bagbazar, Ekdalia, Salt Lake...)"
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-medium text-[#2A201A] placeholder:text-[#80675A]/60 focus:outline-none"
                aria-label="Search pandals by name or area"
              />
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className={`mr-2 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#80675A] transition-all hover:bg-[#B52A22]/10 hover:text-[#B52A22] ${
                  searchQuery ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] sm:text-xs text-[#80675A] px-1">
              <span>
                {searchQuery ? (
                  <span>পাওয়া গেছে <strong className="text-[#B52A22]">{visiblePandals.length}</strong> টি মণ্ডপ</span>
                ) : (
                  <span>{userPosition ? "আপনার অবস্থান থেকে দূরত্ব অনুযায়ী সাজানো" : `${PANDALS.length} টি দুর্গোৎসব মণ্ডপ`}</span>
                )}
              </span>
              <span>পৃষ্ঠা {visiblePandals.length ? page + 1 : 0} / {pageCount}</span>
            </div>
          </div>

          {/* Pandal list */}
          <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-color:#B52A22_#F3E7D5] [scrollbar-width:thin] max-h-[320px] sm:max-h-[380px] lg:max-h-[400px]">
            {pagePandals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#B52A22]/10 text-[#B52A22]">
                  <Search size={18} />
                </span>
                <p className="mt-2.5 font-serif text-base font-bold text-[#2A201A]">কোনো মণ্ডপ পাওয়া যায়নি</p>
                <p className="mt-1 text-xs text-[#80675A]">&ldquo;{searchQuery}&rdquo; দিয়ে কোনো তথ্য নেই।</p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-3 rounded-full bg-[#B52A22] px-4 py-1.5 text-xs font-bold text-[#FFF9EF] transition hover:bg-[#90231D]"
                >
                  সব মণ্ডপ দেখুন
                </button>
              </div>
            ) : (
              pagePandals.map((pandal, index) => {
                const active = pandal.id === selectedPandalId;
                return (
                  <button
                    type="button"
                    key={pandal.id}
                    onClick={() => {
                      choosePandal(pandal);
                      if (showMap && window.innerWidth < 1024) {
                        setMobileTab("map");
                      }
                    }}
                    className={`group w-full rounded-[16px] sm:rounded-[18px] border p-2.5 sm:p-3.5 text-left transition-all duration-200 ${
                      active
                        ? "border-[#B52A22] bg-[#B52A22] text-[#FFF9EF] shadow-md"
                        : "border-[#B52A22]/10 bg-[#F8F1E4]/70 text-[#2A201A] hover:border-[#B52A22]/35 hover:bg-[#F8F1E4]"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex min-w-0 gap-2 sm:gap-2.5">
                        <span
                          className={`grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-full border text-[10px] sm:text-[11px] font-black ${
                            active
                              ? "border-white/35 bg-white/10 text-[#F8D36D]"
                              : "border-[#E5A62C]/70 bg-[#FFF9EF] text-[#B52A22]"
                          }`}
                        >
                          {String(page * PAGE_SIZE + index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-serif text-sm sm:text-base font-bold leading-tight">
                            {pandal.name}
                          </span>
                          <span className={`mt-0.5 block truncate text-[10px] sm:text-xs ${active ? "text-white/80" : "text-[#80675A]"}`}>
                            {pandal.category || "Kolkata Pujo"} · {userPosition ? `${distanceBetween(userPosition, pandal).toFixed(1)} কিমি দূরে` : "কলকাতা ও পশ্চিমবঙ্গ"}
                          </span>
                        </span>
                      </span>
                      <span className={`text-xs sm:text-sm transition-transform group-hover:translate-x-0.5 ${active ? "text-[#F8D36D]" : "text-[#B52A22]"}`}>
                        ↗
                      </span>
                    </span>
                    <span className={`mt-1.5 block line-clamp-2 text-[11px] sm:text-xs leading-relaxed ${active ? "text-white/85" : "text-[#6B574C]"}`}>
                      {pandal.description || pandal.address || "ঐতিহ্যবাহী শারদোৎসব মণ্ডপ।"}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination controls */}
          {pageCount > 1 && (
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#B52A22]/10 pt-2.5">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                className="inline-flex items-center gap-1 rounded-full border border-[#B52A22]/15 bg-[#F8F1E4] px-2.5 py-1 text-xs font-bold text-[#6B574C] transition hover:bg-[#FFF9EF] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={13} /> আগের
              </button>
              <span className="text-[11px] font-bold text-[#B52A22]">
                {page + 1} / {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                className="inline-flex items-center gap-1 rounded-full border border-[#B52A22]/15 bg-[#F8F1E4] px-2.5 py-1 text-xs font-bold text-[#6B574C] transition hover:bg-[#FFF9EF] disabled:cursor-not-allowed disabled:opacity-40"
              >
                পরের <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Selected Destination Card with Instant Google Maps Direction Link */}
          {selectedPandal && (
            <div className="mt-3 rounded-[18px] sm:rounded-[22px] border border-[#E5A62C]/45 bg-[#FFF4D7] p-3 sm:p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-[#B52A22]">নির্বাচিত গন্তব্য · Selected</p>
                  <p className="truncate font-serif text-base sm:text-lg font-bold text-[#2A201A]">{selectedPandal.name}</p>
                </div>
                <a
                  href={directionsFor(selectedPandal, userPosition)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#B52A22] px-3.5 py-2 text-xs font-bold text-[#FFF9EF] shadow-sm transition hover:bg-[#90231D] active:scale-95"
                >
                  Guide Me <ExternalLink size={12} />
                </a>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#FFF9EF]/85 p-2 sm:p-2.5">
                  <p className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-[#B52A22]">
                    <TrainFront size={12} /> নিকটতম মেট্রো
                  </p>
                  <p className="mt-0.5 truncate text-xs font-bold text-[#2A201A]">{metro?.name || liveMetro?.name || "মেট্রো স্টেশন"}</p>
                  <p className="text-[10px] text-[#80675A]">
                    {liveMetro ? `${liveMetro.distance}` : localMetroDistance ? `${localMetroDistance.toFixed(2)} কিমি` : "কলকাতা মেট্রো"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#FFF9EF]/85 p-2 sm:p-2.5">
                  <p className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-[#B52A22]">
                    <BusFront size={12} /> নিকটতম বাস স্টপ
                  </p>
                  <p className="mt-0.5 truncate text-xs font-bold text-[#2A201A]">{bus?.name || liveBus?.name || "বাস স্টপ"}</p>
                  <p className="text-[10px] text-[#80675A]">
                    {liveBus ? `${liveBus.distance}` : localBusDistance ? `${localBusDistance.toFixed(2)} কিমি` : "বাস স্টপ"}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-[#80675A]">
                <span className="inline-flex items-center gap-1">
                  <Route size={12} className="text-[#B52A22]" />
                  {routeQuery.data?.route ? `${routeQuery.data.route.distance} · ${routeQuery.data.route.duration}` : "Google Maps থেকে লাইভ ডিরেকশন"}
                </span>
                <span className="font-semibold text-[#B52A22]">
                  {astar ? `A* Transit Path Ready` : "Live routing"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
