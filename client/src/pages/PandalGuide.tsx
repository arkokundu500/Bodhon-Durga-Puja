// Bodhon visual reminder: map-first travel journal; warm paper panels, vermilion route emphasis, brass rings, and a clear escape route back to the story.
import { Link } from "wouter";
import { ArrowLeft, LocateFixed, MapPin, Route, Sparkles } from "lucide-react";
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
      <main className="container relative px-3.5 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-24 sm:pt-32 lg:pt-36">
        {/* Decorative backdrop glow */}
        <div className="pointer-events-none absolute inset-x-2 top-0 h-64 sm:h-80 rounded-b-[40px] sm:rounded-b-[56px] bg-[radial-gradient(circle_at_16%_10%,rgba(229,166,44,0.22),transparent_34%),linear-gradient(135deg,rgba(181,42,34,0.06),transparent_62%)]" />

        {/* Page Top Header */}
        <div className="relative z-10 mb-6 sm:mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#B52A22] transition hover:gap-3"
            >
              <ArrowLeft size={14} /> বোধনে ফিরুন
            </Link>
            <p className="section-kicker text-[#B52A22]">বোধন পথনির্দেশ · কলকাতা ও পশ্চিমবঙ্গ</p>
            <h1 className="mt-2 font-serif text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-[-0.04em] text-[#2A201A]">
              আপনি কোন পূজার মণ্ডপটি দেখতে যাবেন?
            </h1>
          </div>

          <div className="w-full sm:max-w-xs rounded-[20px] sm:rounded-[24px] border border-[#E5A62C]/40 bg-[#FFF9EF]/95 p-3.5 sm:p-4 shadow-sm backdrop-blur-sm">
            <p className="flex items-center gap-2 text-xs font-bold text-[#B52A22]">
              <LocateFixed size={14} /> লোকেশন গাইড
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#80675A]">
              লোকেশন অন করলে আপনার নিকটবর্তী মণ্ডপগুলি সবার উপরে সাজানো হবে এবং নিকটতম মেট্রো ও বাস স্টপ দেখানো হবে।
            </p>
          </div>
        </div>

        {/* Interactive Pandal Map & Directory */}
        <div className="relative z-10">
          <PandalMap />
        </div>

        {/* 3 Detail Info Cards */}
        <section className="mt-6 sm:mt-8 grid gap-3.5 sm:grid-cols-3">
          <div className="rounded-[20px] sm:rounded-[24px] border border-[#B52A22]/10 bg-[#FFF9EF] p-4 sm:p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B52A22]">নির্বাচিত মণ্ডপ</p>
            <p className="mt-1.5 font-serif text-lg sm:text-xl font-bold text-[#2A201A]">{selected.name}</p>
            <p className="mt-0.5 text-xs text-[#80675A]">{selected.category || "Kolkata Pujo"}</p>
          </div>

          <div className="rounded-[20px] sm:rounded-[24px] border border-[#B52A22]/10 bg-[#FFF9EF] p-4 sm:p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B52A22]">লাইভ ট্রানজিট ও রুট</p>
            <p className="mt-1.5 flex gap-2 text-xs sm:text-sm leading-relaxed text-[#6B574C]">
              <Route size={15} className="mt-0.5 shrink-0 text-[#B52A22]" />
              আপনার বর্তমান অবস্থান থেকে নিকটতম মেট্রো ও বাস স্টপ দেখে Google Maps-এ সরাসরি রুট পান।
            </p>
          </div>

          <div className="rounded-[20px] sm:rounded-[24px] border border-[#B52A22]/10 bg-[#FFF9EF] p-4 sm:p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B52A22]">তথ্য ও পরিচয়</p>
            <p className="mt-1.5 flex gap-2 text-xs sm:text-sm leading-relaxed text-[#6B574C]">
              <Sparkles size={15} className="mt-0.5 shrink-0 text-[#E5A62C]" />
              {selected.description || "ঐতিহ্য ও শিল্পের মেলবন্ধনে গড়ে ওঠা কলকাতার শ্রেষ্ঠ দুর্গোৎসব মণ্ডপ।"}
            </p>
          </div>
        </section>
      </main>

      <AudioDock />

      <footer className="bg-[#2A201A] py-8 text-center text-xs font-semibold text-[#FFF9EF]/70">
        <div className="container px-4 flex flex-col items-center gap-4">
          <VisitorCount />
          <p className="text-[#FFF9EF]/50">বোধন · ২০২৬ · পথ হারাবেন না, মুহূর্ত হারাবেন না।</p>
        </div>
      </footer>
    </div>
  );
}
