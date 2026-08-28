import { useState } from "react";
import { Maximize2, Sparkles, X } from "lucide-react";

export const GALLERY_PHOTOS = [
  { id: "gold-classic", src: "/gallery-durga-gold-classic.jpg", alt: "Traditional Golden Daker Saaj Durga Idol" },
  { id: "silver-shola", src: "/gallery-durga-silver-shola.jpg", alt: "Royal Silver Shola Tableau Durga Idol" },
  { id: "patachitra-folk", src: "/gallery-durga-patachitra-folk.jpg", alt: "Bengal Folk Patachitra Durga Idol" },
  { id: "cinematic-reel", src: "/gallery-durga-cinematic-reel.jpg", alt: "Cinematic Film Reel Tribute Durga Idol" },
  { id: "white-tiger", src: "/gallery-durga-white-tiger.jpg", alt: "Serene White Clay Durga Idol" },
];

export function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Duplicate items 4 times to guarantee a seamless, glitch-free continuous marquee loop
  const marqueeItems = [...GALLERY_PHOTOS, ...GALLERY_PHOTOS, ...GALLERY_PHOTOS, ...GALLERY_PHOTOS];

  return (
    <section id="gallery" className="relative overflow-hidden bg-[#F1E5D3] py-20 sm:py-28">
      {/* Decorative background radial pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(229,166,44,0.18)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(181,42,34,0.12)_0%,transparent_50%)]" />

      {/* Section Header */}
      <div className="container relative z-10 mb-8 sm:mb-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker text-[#B52A22] flex items-center gap-2">
              <Sparkles size={14} /> দুর্গোৎসব চিত্রশালা · Motion Gallery
            </p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.95] tracking-[-0.05em] text-[#2A201A]">
              এক পুজো, হাজার ফ্রেম।
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#80675A]">
            Click for full view
          </p>
        </div>
      </div>

      {/* Continuous Motion Carousel Track */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Smooth Edge Fade Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 sm:w-32 bg-gradient-to-r from-[#F1E5D3] via-[#F1E5D3]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 sm:w-32 bg-gradient-to-l from-[#F1E5D3] via-[#F1E5D3]/80 to-transparent" />

        {/* Continuous Horizontal Marquee Track (Row 1) */}
        <div className="flex w-max gap-5 sm:gap-7 animate-gallery-marquee hover:[animation-play-state:paused]">
          {marqueeItems.map((photo, index) => (
            <div
              key={`row1-${photo.id}-${index}`}
              onClick={() => setSelectedPhoto(photo.src)}
              className="group relative h-[360px] sm:h-[480px] w-[260px] sm:w-[360px] shrink-0 cursor-pointer overflow-hidden rounded-[24px] sm:rounded-[32px] border border-[#B52A22]/15 bg-[#2A201A] shadow-[0_16px_45px_rgba(91,47,28,0.14)] transition-all duration-500 hover:-translate-y-2 hover:border-[#E5A62C] hover:shadow-[0_24px_60px_rgba(229,166,44,0.22)]"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />

              {/* Subtle hover vignette & fullscreen indicator icon */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-black/50 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-105">
                <Maximize2 size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Pure Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close full view"
            className="absolute right-5 top-5 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-2xl transition hover:bg-white/25 hover:scale-105 active:scale-95"
          >
            <X size={22} />
          </button>

          <div
            className="relative max-h-[92vh] max-w-6xl overflow-hidden rounded-[24px] sm:rounded-[32px] border border-white/20 bg-black/60 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto}
              alt="Durga Puja Full View"
              className="max-h-[85vh] w-auto max-w-full rounded-[18px] sm:rounded-[24px] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
