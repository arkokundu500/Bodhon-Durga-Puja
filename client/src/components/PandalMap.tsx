import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BusFront, ChevronLeft, ChevronRight, ExternalLink, LocateFixed, MapPin, Route, Search, TrainFront, X } from "lucide-react";
import { MapView } from "@/components/Map";
import { BUS_STOPS, METRO_STATIONS, PANDALS, type Pandal, type TransitPoint, useBodhonStore } from "@/lib/bodhon-data";
import { aStarRoute } from "@/lib/a-star";
import { startLocationTracking, type Coordinates } from "@/lib/location";
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

const directionsFor = (pandal: Pandal, origin?: Coordinates) => {
  const originPart = origin ? `&origin=${origin.lat},${origin.lng}` : "";
  return `https://www.google.com/maps/dir/?api=1${originPart}&destination=${pandal.lat},${pandal.lng}&travelmode=transit`;
};

export function PandalMap({ showMap = true }: { showMap?: boolean }) {
  const { selectedPandalId, setSelectedPandal } = useBodhonStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [located, setLocated] = useState(false);
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);
  const [mapSdkReady, setMapSdkReady] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRefs = useRef<google.maps.Marker[]>([]);
  const locationTrackerRef = useRef<ReturnType<typeof startLocationTracking>>(null);

  // Filter pandals by search term
  const filteredPandals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return PANDALS;
    return PANDALS.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }, [searchQuery]);

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

  const selectedRef = useRef(selectedPandal);
  const userRef = useRef(userPosition);
  selectedRef.current = selectedPandal;
  userRef.current = userPosition;

  const pageCount = Math.max(1, Math.ceil(visiblePandals.length / PAGE_SIZE));
  const pagePandals = visiblePandals.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const metro = useMemo(() => nearestPoint(selectedPandal, METRO_STATIONS), [selectedPandal]);
  const bus = useMemo(() => nearestPoint(selectedPandal, BUS_STOPS), [selectedPandal]);
  const routeInput = useMemo(() => userPosition ? { originLat: userPosition.lat, originLng: userPosition.lng, destinationLat: selectedPandal.lat, destinationLng: selectedPandal.lng } : undefined, [userPosition, selectedPandal.lat, selectedPandal.lng]);
  const routeQuery = trpc.guide.route.useQuery(routeInput as { originLat: number; originLng: number; destinationLat: number; destinationLng: number }, { enabled: Boolean(routeInput), retry: false, staleTime: 120_000 });
  const astar = useMemo(() => userPosition && routeQuery.data?.route ? aStarRoute({ id: "user", ...userPosition }, { id: selectedPandal.id, lat: selectedPandal.lat, lng: selectedPandal.lng }, routeQuery.data.route.steps) : null, [userPosition, selectedPandal, routeQuery.data?.route]);

  const redrawMarkers = useCallback((map: google.maps.Map) => {
    markerRefs.current.forEach((marker) => marker.setMap(null));
    const selected = selectedRef.current;
    const user = userRef.current;
    const markers = visiblePandals.map((pandal) => new google.maps.Marker({
      map,
      position: { lat: pandal.lat, lng: pandal.lng },
      title: pandal.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: pandal.id === selected?.id ? 8 : 4,
        fillColor: pandal.id === selected?.id ? "#B52A22" : "#F6C85B",
        fillOpacity: 0.95,
        strokeColor: "#FFF9EF",
        strokeWeight: pandal.id === selected?.id ? 2 : 1.5,
      },
      zIndex: pandal.id === selected?.id ? 100 : 1,
    }));
    const nearestMetro = selected ? nearestPoint(selected, METRO_STATIONS) : null;
    const nearestBus = selected ? nearestPoint(selected, BUS_STOPS) : null;
    if (nearestMetro) markers.push(new google.maps.Marker({ map, position: { lat: nearestMetro.lat, lng: nearestMetro.lng }, title: `Nearest metro: ${nearestMetro.name}`, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: "#2563EB", fillOpacity: 1, strokeColor: "#FFF9EF", strokeWeight: 2 }, zIndex: 120 }));
    if (nearestBus) markers.push(new google.maps.Marker({ map, position: { lat: nearestBus.lat, lng: nearestBus.lng }, title: `Nearest bus stop: ${nearestBus.name}`, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: "#18804B", fillOpacity: 1, strokeColor: "#FFF9EF", strokeWeight: 2 }, zIndex: 120 }));
    if (selected) markers.push(new google.maps.Marker({ map, position: { lat: selected.lat, lng: selected.lng }, title: `Selected: ${selected.name}`, icon: { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 6, fillColor: "#C62828", fillOpacity: 1, strokeColor: "#FFF9EF", strokeWeight: 2 }, zIndex: 200 }));
    if (user) markers.push(new google.maps.Marker({ map, position: user, title: "Your live location", icon: { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 6, fillColor: "#18804B", fillOpacity: 1, strokeColor: "#FFF9EF", strokeWeight: 2 }, zIndex: 210 }));
    markerRefs.current = markers;
  }, [visiblePandals]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapSdkReady(true);
    redrawMarkers(map);
    if (selectedRef.current) {
      map.panTo({ lat: selectedRef.current.lat, lng: selectedRef.current.lng });
    }
  }, [redrawMarkers]);

  useEffect(() => {
    if (!mapRef.current) return;
    redrawMarkers(mapRef.current);
    if (selectedPandal) {
      mapRef.current.panTo({ lat: selectedPandal.lat, lng: selectedPandal.lng });
    }
  }, [selectedPandal, userPosition, visiblePandals, redrawMarkers]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, userPosition]);

  useEffect(() => () => {
    locationTrackerRef.current?.stop();
  }, []);

  useEffect(() => {
    if (selectedPandal) {
      setMapCenter({ lat: selectedPandal.lat, lng: selectedPandal.lng });
    }
  }, [selectedPandal?.lat, selectedPandal?.lng]);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  const locateMe = () => {
    locationTrackerRef.current?.stop();
    locationTrackerRef.current = startLocationTracking(navigator.geolocation, (position) => {
      setUserPosition(position);
      setMapCenter(position);
      setLocated(true);
      mapRef.current?.panTo(position);
    }, () => setLocated(false));
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
    <div className={`grid min-h-[640px] overflow-hidden rounded-[28px] border border-[#B52A22]/12 bg-[#EEE1CD] shadow-[0_26px_90px_rgba(91,47,28,0.14)] sm:rounded-[36px] ${showMap ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}>
      {showMap && (
        <div className="relative min-h-[380px] sm:min-h-[460px] overflow-hidden bg-[#DDE2C8]">
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
                <MapPin size={38} fill="#C62828" strokeWidth={1.7} />
              </span>
            )}
            <span className="absolute bottom-5 right-5 rounded-2xl border border-white/50 bg-[#FFF9EF]/86 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2A201A] shadow-lg">
              Own-built fallback
            </span>
          </div>

          <MapView className="absolute inset-0 z-10 h-full min-h-[380px] sm:min-h-[460px] bg-transparent" initialCenter={mapCenter} initialZoom={12} onMapReady={handleMapReady} onMapError={() => { if (!mapRef.current) setMapSdkReady(false); }} />

          <div className="absolute left-4 top-4 sm:left-5 sm:top-5 z-20 rounded-full border border-white/40 bg-[#FFF9EF]/94 px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-[#2A201A] shadow-lg backdrop-blur-sm">
            Red pin = selected pandal
          </div>

          <button type="button" onClick={locateMe} className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#FFF9EF] px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs font-bold text-[#2A201A] shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95">
            <LocateFixed size={15} className={located ? "text-[#18804B]" : "text-[#80675A]"} />
            {located ? "Tracking location" : "Use my location"}
          </button>

          {userFallbackPosition && markerLayerState.fallbackUser && (
            <span title="Your live location" className="absolute z-10 -translate-x-1/2 -translate-y-full text-[#18804B] drop-shadow-[0_3px_4px_rgba(42,32,26,0.4)]" style={{ left: `${userFallbackPosition.left}%`, top: `${userFallbackPosition.top}%` }}>
              <MapPin size={36} fill="#18804B" strokeWidth={1.8} />
            </span>
          )}

          <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-20 rounded-2xl border border-white/30 bg-[#2A201A]/85 px-3 py-2 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-white/85 shadow-lg backdrop-blur-sm">
            <span className="block text-[#F5C85B]">{searchQuery ? "Filtered pandals" : "Directory map"}</span>
            {visiblePandals.length} pandals
          </div>
        </div>
      )}

      <div className={`flex min-h-[580px] sm:min-h-[680px] flex-col bg-[#FFF9EF] p-4 sm:p-7 lg:p-8 ${showMap ? "" : "mx-auto w-full max-w-5xl"}`}>
        {/* Header section */}
        <div className="flex items-start justify-between gap-4 border-b border-[#B52A22]/10 pb-4">
          <div className="min-w-0 flex-1">
            <p className="section-kicker text-[#B52A22]">Google Maps API</p>
            <h3 className="mt-1.5 font-serif text-2xl sm:text-3xl font-bold leading-tight text-[#2A201A]">Pandal Directory</h3>
          </div>
          <span className="alpona-ring grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-full border border-[#E5A62C]/70 text-[#B52A22]">
            <MapPin size={18} />
          </span>
        </div>

        {/* Smooth Search Bar */}
        <div className="mt-4">
          <div className="relative flex items-center rounded-2xl border border-[#B52A22]/20 bg-[#F8F1E4] shadow-sm transition-all focus-within:border-[#B52A22] focus-within:ring-2 focus-within:ring-[#B52A22]/15">
            <Search size={17} className="ml-3.5 shrink-0 text-[#80675A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pandal, area, or zone (e.g. Bagbazar, Sovabazar, Ekdalia...)"
              className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-sm font-medium text-[#2A201A] placeholder:text-[#80675A]/60 focus:outline-none"
              aria-label="Search pandals by name or area"
            />
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className={`mr-2 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#80675A] transition-all hover:bg-[#B52A22]/10 hover:text-[#B52A22] ${searchQuery ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-[#80675A] px-1">
            <span key={searchQuery ? "query-active" : "query-empty"}>
              {searchQuery ? (
                <span>Found <strong className="text-[#B52A22]">{visiblePandals.length}</strong> matching &ldquo;{searchQuery}&rdquo;</span>
              ) : (
                <span>{userPosition ? "Sorted by distance from you" : `${PANDALS.length} Durga Puja pandals`}</span>
              )}
            </span>
            <span>Page {visiblePandals.length ? page + 1 : 0} / {pageCount}</span>
          </div>
        </div>

        {/* Pandal list */}
        <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto pr-1 [scrollbar-color:#B52A22_#F3E7D5] [scrollbar-width:thin] max-h-[380px] sm:max-h-[440px]">
          {pagePandals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#B52A22]/10 text-[#B52A22]">
                <Search size={22} />
              </span>
              <p className="mt-3 font-serif text-lg font-bold text-[#2A201A]">কোনো প্যান্ডেল পাওয়া যায়নি</p>
              <p className="mt-1 text-xs text-[#80675A]">No pandals found matching &ldquo;{searchQuery}&rdquo;.</p>
              <button
                type="button"
                onClick={clearSearch}
                className="mt-4 rounded-full bg-[#B52A22] px-4 py-2 text-xs font-bold text-[#FFF9EF] transition hover:bg-[#90231D]"
              >
                Reset Search
              </button>
            </div>
          ) : (
            pagePandals.map((pandal, index) => {
              const active = pandal.id === selectedPandalId;
              return (
                <button
                  type="button"
                  key={pandal.id}
                  onClick={() => choosePandal(pandal)}
                  className={`group w-full rounded-[18px] sm:rounded-[20px] border p-3 sm:p-4 text-left transition-all duration-300 ${active
                    ? "border-[#B52A22] bg-[#B52A22] text-[#FFF9EF] shadow-[0_12px_26px_rgba(181,42,34,0.16)]"
                    : "border-[#B52A22]/10 bg-[#F8F1E4]/70 text-[#2A201A] hover:-translate-y-0.5 hover:border-[#B52A22]/35 hover:bg-[#F8F1E4]"
                    }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 gap-2.5 sm:gap-3">
                      <span className={`grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-full border text-[11px] sm:text-xs font-black ${active
                        ? "border-white/35 bg-white/10 text-[#F8D36D]"
                        : "border-[#E5A62C]/70 bg-[#FFF9EF] text-[#B52A22]"
                        }`}>
                        {String(page * PAGE_SIZE + index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-serif text-base sm:text-lg font-bold leading-tight">
                          {pandal.name}
                        </span>
                        <span className={`mt-0.5 block truncate text-[11px] sm:text-xs ${active ? "text-white/75" : "text-[#80675A]"}`}>
                          {pandal.category || "Kolkata Pujo"} · {userPosition ? `${distanceBetween(userPosition, pandal).toFixed(1)} km from you` : "Open Sourced Location Map"}
                        </span>
                      </span>
                    </span>
                    <span className={`mt-1 text-sm transition-transform group-hover:translate-x-1 ${active ? "text-[#F8D36D]" : "text-[#B52A22]"}`}>
                      ↗
                    </span>
                  </span>
                  <span className={`mt-2 block text-xs leading-relaxed ${active ? "text-white/82" : "text-[#6B574C]"}`}>
                    {pandal.description || pandal.address || "Coordinates imported."}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Pagination controls */}
        {pageCount > 1 && (
          <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#B52A22]/10 pt-3">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="inline-flex items-center gap-1 rounded-full border border-[#B52A22]/15 bg-[#F8F1E4] px-3 py-1.5 text-xs font-bold text-[#6B574C] transition hover:bg-[#FFF9EF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-[11px] sm:text-xs font-bold text-[#B52A22]">
              {page + 1} of {pageCount}
            </span>
            <button
              type="button"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              className="inline-flex items-center gap-1 rounded-full border border-[#B52A22]/15 bg-[#F8F1E4] px-3 py-1.5 text-xs font-bold text-[#6B574C] transition hover:bg-[#FFF9EF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Selected Destination Card */}
        {selectedPandal && (
          <div className="mt-4 rounded-[20px] sm:rounded-[24px] border border-[#E5A62C]/40 bg-[#FFF4D7] p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B52A22]">Selected destination</p>
                <p className="mt-0.5 truncate font-serif text-base sm:text-lg font-bold text-[#2A201A]">{selectedPandal.name}</p>
                <p className="mt-0.5 truncate text-[11px] sm:text-xs text-[#80675A]">{selectedPandal.category || "Kolkata Pujo"} · {selectedPandal.lat.toFixed(5)}, {selectedPandal.lng.toFixed(5)}</p>
              </div>
              <a
                href={directionsFor(selectedPandal, userPosition ?? undefined)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#B52A22] px-3.5 py-2 text-xs font-black text-[#FFF9EF] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#90231D]"
              >
                Guide Me <ExternalLink size={13} />
              </a>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl bg-[#FFF9EF]/80 p-2.5 sm:p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#B52A22]">
                  <TrainFront size={13} /> Nearest Metro
                </p>
                <p className="mt-0.5 truncate text-xs sm:text-sm font-bold text-[#2A201A]">{metro?.name || liveMetro?.name || "No supplied metro match"}</p>
                <p className="mt-0.5 text-[11px] sm:text-xs text-[#80675A]">
                  {liveMetro ? `${liveMetro.distance} walk · ${liveMetro.duration}` : localMetroDistance ? `${localMetroDistance.toFixed(2)} km straight-line` : "Supplied metro JSON"}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-[#FFF9EF]/80 p-2.5 sm:p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#B52A22]">
                  <BusFront size={13} /> Nearest Bus Stop
                </p>
                <p className="mt-0.5 truncate text-xs sm:text-sm font-bold text-[#2A201A]">{bus?.name || liveBus?.name || "No supplied bus match"}</p>
                <p className="mt-0.5 text-[11px] sm:text-xs text-[#80675A]">
                  {liveBus ? `${liveBus.distance} walk · ${liveBus.duration}` : localBusDistance ? `${localBusDistance.toFixed(2)} km straight-line` : "Supplied bus JSON"}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-[#80675A]">
              <span className="inline-flex items-center gap-1.5">
                <Route size={13} className="text-[#B52A22]" />
                {routeQuery.data?.route ? `${routeQuery.data.route.distance} · ${routeQuery.data.route.duration} by transit` : "Use my location for live transit"}
              </span>
              <span className="font-semibold text-[#B52A22]">
                {astar ? `A* over Google steps · ${astar.path.length} nodes` : "Live routing ready"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
