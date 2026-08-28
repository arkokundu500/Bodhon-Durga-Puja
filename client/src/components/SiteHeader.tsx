// Bodhon visual reminder: floating editorial header, warm paper translucency, vermilion route-line accent, bilingual utility labels.
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/_core/hooks/useAuth";
import { isAdminUser } from "@/lib/admin-access";

const links = [
  { href: "/#ma", label: "জাগো মা দুর্গা" },
  { href: "/#timeline", label: "দিনপঞ্জি" },
  { href: "/#gallery", label: "চিত্রশালা" },
  { href: "/#guide", label: "প্যান্ডেল গাইড" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const canManageMedia = isAdminUser(user);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 36);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 px-4 pt-4 transition-all duration-500 sm:px-6 ${scrolled ? "pt-3" : "pt-4"}`}>
      <div className={`mx-auto flex max-w-[1440px] items-center justify-between rounded-full border px-3 py-2 pl-2 transition-all duration-500 sm:px-4 ${scrolled ? "border-[#B52A22]/15 bg-[#F8F1E4]/94 shadow-[0_14px_50px_rgba(91,47,28,0.15)] backdrop-blur-xl" : "border-white/25 bg-[#2A201A]/25 text-white backdrop-blur-md"}`}>
        <a href="/" className="group flex items-center gap-3" aria-label="বোধন home">
          <BrandMark size="sm" />
          <span className="leading-none">
            <span className={`block font-serif text-lg font-bold tracking-[-0.04em] transition-colors ${scrolled ? "text-[#2A201A]" : "text-white"}`}>বোধন</span>
            <span className={`hidden text-[9px] font-semibold uppercase tracking-[0.22em] transition-colors sm:block ${scrolled ? "text-[#B52A22]/70" : "text-white/70"}`}>Durga Puja 2026</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={`rounded-full px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 ${scrolled ? "text-[#6B574C] hover:bg-[#B52A22]/8 hover:text-[#B52A22]" : "text-white/80 hover:bg-white/12 hover:text-white"}`}>
              {link.label}
            </a>
          ))}
          {canManageMedia && <a href="/media-manager" className={`rounded-full px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 ${scrolled ? "text-[#6B574C] hover:bg-[#B52A22]/8 hover:text-[#B52A22]" : "text-white/80 hover:bg-white/12 hover:text-white"}`}>Studio ↗</a>}
        </nav>

        <a href="/guide" className={`hidden rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-all hover:-translate-y-0.5 sm:inline-flex ${scrolled ? "bg-[#B52A22] text-[#FFF9EF] shadow-[0_8px_18px_rgba(181,42,34,0.23)] hover:bg-[#90231D]" : "border border-white/30 bg-white/10 text-white hover:bg-white/20"}`}>
          Guide Me <span className="ml-2">↗</span>
        </a>

        <button type="button" className={`grid h-10 w-10 place-items-center rounded-full md:hidden ${scrolled ? "text-[#2A201A]" : "text-white"}`} onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="mx-auto mt-2 max-w-[1440px] rounded-[24px] border border-[#B52A22]/12 bg-[#F8F1E4]/96 p-3 text-[#2A201A] shadow-[0_14px_50px_rgba(91,47,28,0.16)] backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-semibold transition-colors hover:bg-[#B52A22]/8 hover:text-[#B52A22]">{link.label}</a>
          ))}
          {canManageMedia && <a href="/media-manager" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-semibold text-[#B52A22] transition-colors hover:bg-[#B52A22]/8">Studio ↗</a>}
          <a href="/guide" onClick={() => setOpen(false)} className="mt-2 block rounded-2xl bg-[#B52A22] px-4 py-3 text-center text-sm font-bold text-[#FFF9EF]">Guide Me ↗</a>
        </nav>
      )}
    </header>
  );
}
