// Bodhon visual reminder: map-first travel journal; warm paper panels, vermilion route emphasis, brass rings, and a clear escape route back to the story.
import { Link } from "wouter";
import { ArrowLeft, LocateFixed, MapPin, Route } from "lucide-react";
import { useBodhonStore, PANDALS } from "@/lib/bodhon-data";
import { PandalMap } from "@/components/PandalMap";
import { SiteHeader } from "@/components/SiteHeader";
import { AudioDock } from "@/components/AudioDock";

import { VisitorCount } from "@/components/VisitorCount";

export default function PandalGuide() {
  const { selectedPandalId } = useBodhonStore();
  const selected = PANDALS.find((pandal) => pandal.id === selectedPandalId) ?? PANDALS[0];

  return (
    <div className="min-h-screen bg-[#F8F1E4] text-[#2A201A]">
      <SiteHeader />
      <main className="container relative pb-20 pt-28 sm:pt-36">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-72 rounded-b-[56px] bg-[radial-gradient(circle_at_16%_10%,rgba(229,166,44,0.22),transparent_34%),linear-gradient(135deg,rgba(181,42,34,0.06),transparent_62%)] sm:inset-x-6 lg:inset-x-8" />
        <div className="relative z-10 mb-8 sm:mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="mb-4 sm:mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#B52A22] transition hover:gap-3">
              <ArrowLeft size={14} /> বোধনে ফিরুন
            </Link>
            <p className="section-kicker text-[#B52A22]">বোধন পথনির্দেশ · কলকাতা</p>
            <h1 className="mt-3 font-serif text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-[-0.05em] text-[#2A201A]">
              আপনি কোন পূজার মণ্ডপটি দেখতে যাবেন?
            </h1>
          </div>
          <div className="max-w-xs rounded-[24px] border border-[#E5A62C]/35 bg-[#FFF9EF] p-4 shadow-[0_16px_40px_rgba(91,47,28,0.08)]">
            <p className="flex items-center gap-2 text-xs font-bold text-[#B52A22]">
              <LocateFixed size={15} /> লোকেশন চালু করুন
            </p>
            <p className="mt-2 text-xs sm:text-sm leading-6 text-[#80675A]">
              আপনার browser location দিলে কাছের প্যান্ডেলকে আগে সাজিয়ে দেখাব।
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <PandalMap />
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] sm:rounded-[26px] border border-[#B52A22]/10 bg-[#FFF9EF] p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B52A22]">Selected Pandal</p>
            <p className="mt-2 font-serif text-lg sm:text-xl font-bold">{selected.name}</p>
            <p className="mt-1 text-xs sm:text-sm text-[#80675A]">{selected.category || "Kolkata Pujo"}</p>
          </div>
          <div className="rounded-[24px] sm:rounded-[26px] border border-[#B52A22]/10 bg-[#FFF9EF] p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B52A22]">Live routing</p>
            <p className="mt-2 flex gap-2 text-xs sm:text-sm leading-6 text-[#6B574C]">
              <Route size={15} className="mt-1 shrink-0 text-[#B52A22]" />
              Use your location inside the directory to calculate transit, nearest metro, nearest bus stop, and walking legs.
            </p>
          </div>
          <div className="rounded-[24px] sm:rounded-[26px] border border-[#B52A22]/10 bg-[#FFF9EF] p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B52A22]">Source note</p>
            <p className="mt-2 flex gap-2 text-xs sm:text-sm leading-6 text-[#6B574C]">
              <MapPin size={15} className="mt-1 shrink-0 text-[#B52A22]" />
              {selected.description || "Coordinates and name imported from the supplied CSV; transit comes from the supplied JSON datasets."}
            </p>
          </div>
        </section>
      </main>
      <AudioDock />
      <footer className="bg-[#2A201A] py-8 text-center text-xs font-semibold text-[#FFF9EF]/70">
        <div className="container flex flex-col items-center gap-4">
          <VisitorCount />
          <p className="text-[#FFF9EF]/50">বোধন · ২০২৬ · পথ হারাবেন না, মুহূর্ত হারাবেন না।</p>
        </div>
      </footer>
    </div>
  );
}
