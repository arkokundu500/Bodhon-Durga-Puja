import { create } from "zustand";
import csvPandals from "@/data/csv-pandals.json";
import metroStations from "@/data/metro-stations.json";
import busStops from "@/data/bus-stops.json";

export type PujaDay = { eyebrow: string; title: string; date: string; isoDate: string; note?: string };
export type TransitSummary = { mode: "metro" | "bus" | "rail" | "auto"; label: string; distance?: string; duration?: string; location?: { lat: number; lng: number } };
export type Pandal = { id: string; name: string; description?: string; address?: string; category?: string; lat: number; lng: number; phone?: string; website?: string; imageUrl?: string; active?: boolean; transit: TransitSummary[] };
export type TransitPoint = { id: string; name: string; nameBn?: string; lat: number; lng: number };
export type Track = { id: string; title: string; subtitle: string; cover: string; src: string };

export const PUJA_TIMELINE: PujaDay[] = [
  { eyebrow: "আলো জ্বলার আগে", title: "মহালয়া", date: "শনিবার, ১০ অক্টোবর ২০২৬", isoDate: "2026-10-10T06:00:00+05:30", note: "চণ্ডীপাঠ, ভোরের রেডিও, মায়ের আগমনী" },
  { eyebrow: "প্যান্ডেলে প্রথম পা", title: "মহা পঞ্চমী", date: "বৃহস্পতিবার, ১৫ অক্টোবর ২০২৬", isoDate: "2026-10-15T06:00:00+05:30", note: "পুজো আসছে না, পুজো এসেই গেছে!" },
  { eyebrow: "বোধনের দিন", title: "মহা ষষ্ঠী", date: "শুক্রবার, ১৬ অক্টোবর ২০২৬", isoDate: "2026-10-16T06:00:00+05:30", note: "Finally, Pujo mode ON!" },
  { eyebrow: "নবপত্রিকার সকাল", title: "মহা সপ্তমী", date: "শনিবার, ১৭ অক্টোবর ২০২৬", isoDate: "2026-10-17T06:00:00+05:30", note: "কিছু সূচিতে রবিবার, ১৮ অক্টোবর পর্যন্ত" },
  { eyebrow: "অষ্টমীর অঞ্জলি", title: "মহা অষ্টমী / সন্ধি পূজা", date: "সোমবার, ১৯ অক্টোবর ২০২৬", isoDate: "2026-10-19T06:00:00+05:30", note: "১০৮ প্রদীপ, ঢাকের তালে প্রণাম" },
  { eyebrow: "শেষ প্রহরের শক্তি", title: "মহা নবমী", date: "মঙ্গলবার, ২০ অক্টোবর ২০২৬", isoDate: "2026-10-20T06:00:00+05:30", note: "কাল থেকেই আবার normal life? অসম্ভব" },
  { eyebrow: "ফিরে আসার গান", title: "বিজয়া দশমী / বিসর্জন", date: "বুধবার, ২১ অক্টোবর ২০২৬", isoDate: "2026-10-21T16:00:00+05:30", note: "সিঁদুরখেলা, মিষ্টি মুখ, ‘আবার এসো মা’" },
];

export const PANDALS: Pandal[] = (csvPandals as Array<Omit<Pandal, "transit">>).map((pandal) => ({ ...pandal, transit: [] }));
export const METRO_STATIONS: TransitPoint[] = metroStations as TransitPoint[];
export const BUS_STOPS: TransitPoint[] = busStops as TransitPoint[];

export const TRACKS: Track[] = [
  { id: "dhak-baja-kashor-baja", title: "ঢাক বাজা কাঁসর বাজা", subtitle: "Durgā Pūjā Special · আগমনী energy", cover: "/manus-storage/Dhak-Baja-Kashor-Baja_ab8e7ed6.jpg", src: "/manus-storage/DhakBajaKashorBaja_7b910599.mp3" },
  { id: "dhaker-taley", title: "ঢাকের তালে", subtitle: "শারদ rhythm · pujo on the move", cover: "/manus-storage/DhakerTaleySong_87c024b1.jpg", src: "/manus-storage/DhakerTaleySong_a808da27.mp3" },
  { id: "dugga-ma", title: "দুগ্গা মা", subtitle: "মায়ের ডাক · festive sing-along", cover: "/manus-storage/DuggaMa_06c18295.jpg", src: "/manus-storage/DuggaMa_8dcf8b5b.mp3" },
  { id: "dugga-elo", title: "দুগ্গা এলো", subtitle: "শহরে মায়ের arrival · cinematic pujo", cover: "/manus-storage/DuggaElo_6e6d2c7e.jpg", src: "/manus-storage/DuggaEloSong_0e19a729.mp3" },
];

type BodhonStore = { selectedPandalId: string; activeTrackId: string; isPlaying: boolean; setSelectedPandal: (id: string) => void; setActiveTrack: (id: string) => void; setIsPlaying: (value: boolean) => void };
export const useBodhonStore = create<BodhonStore>((set) => ({ selectedPandalId: PANDALS[0]?.id ?? "", activeTrackId: TRACKS[0].id, isPlaying: false, setSelectedPandal: (selectedPandalId) => set({ selectedPandalId }), setActiveTrack: (activeTrackId) => set({ activeTrackId, isPlaying: true }), setIsPlaying: (isPlaying) => set({ isPlaying }) }));
