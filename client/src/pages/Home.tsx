// Bodhon visual reminder: contemporary Bengali editorial scroll story; cream paper, marigold radiance, vermilion thread, asymmetric compositions, and practical wonder.
import { useLayoutEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, CalendarDays, Compass, MapPinned, Sparkles } from "lucide-react";
import { Link } from "wouter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AudioDock } from "@/components/AudioDock";
import { BrandMark } from "@/components/BrandMark";
import { Countdown } from "@/components/Countdown";
import { Gallery } from "@/components/Gallery";
import { PandalMap } from "@/components/PandalMap";
import { SiteHeader } from "@/components/SiteHeader";
import { VisitorCount } from "@/components/VisitorCount";
import { PUJA_TIMELINE } from "@/lib/bodhon-data";

gsap.registerPlugin(ScrollTrigger);

const toBengaliNumber = (value: number) => String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.from(".hero-kicker", { opacity: 0, y: 20, duration: 0.7 })
        .from(".hero-title", { opacity: 0, y: 34, duration: 0.9 }, "-=0.35")
        .from(".hero-copy", { opacity: 0, y: 22, duration: 0.7 }, "-=0.5")
        .from(".hero-actions", { opacity: 0, y: 18, duration: 0.6 }, "-=0.4")
        .from(".hero-sidecard", { opacity: 0, x: 30, duration: 0.8 }, "-=0.55");

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: 32,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 84%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-left").forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          x: -34,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 80%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-right").forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          x: 34,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 80%", once: true },
        });
      });

      if (heroRef.current) {
        gsap.to(".hero-sidecard", {
          y: -90,
          rotate: 4,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-haze", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
        });
      }

      gsap.fromTo(".timeline-line", { scaleY: 0 }, { scaleY: 1, transformOrigin: "top center", ease: "none", scrollTrigger: { trigger: ".timeline-wrap", start: "top 65%", end: "bottom 75%", scrub: true } });
    }, pageRef);

    return () => context.revert();
  }, []);


  return (
    <div ref={pageRef} className="min-h-screen overflow-hidden bg-[#F8F1E4] text-[#2A201A]">
      <SiteHeader />
      <main>
        <section ref={heroRef} id="top" className="hero-section relative isolate flex min-h-[760px] items-end overflow-hidden bg-[#2A201A] pb-14 pt-32 text-[#FFF9EF] sm:min-h-[840px] sm:pb-20 lg:min-h-[900px] lg:pb-24">
          <video className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.84]" autoPlay muted loop playsInline poster="/durga-gold-wide_329e4673.png" src="/kashful-loop_e16b0912.mp4" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(42,32,26,0.78)_0%,rgba(42,32,26,0.42)_48%,rgba(42,32,26,0.2)_100%)]" />
          <div className="hero-haze absolute -bottom-24 left-[35%] -z-10 h-72 w-72 rounded-full bg-[#E5A62C]/20 blur-3xl" />
          <div className="absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(rgba(255,249,239,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,249,239,0.08)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
          <div className="container relative z-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.6fr)]">
            <div className="max-w-3xl">
              <p className="hero-kicker mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#F8D36D]"><span className="h-px w-10 bg-[#F8D36D]" /> শরৎ ২০২৬ · পশ্চিমবঙ্গ</p>
              <h1 className="hero-title max-w-[9ch] font-serif text-[clamp(5.5rem,17vw,13.5rem)] font-black leading-[0.74] tracking-[-0.08em] text-[#FFF9EF]">বোধন</h1>
              <p className="hero-copy mt-8 max-w-xl font-serif text-xl leading-relaxed text-[#FFF9EF]/88 sm:text-2xl">মায়ের আগমনের গল্প। শহর জুড়ে আলোর পথ। মণ্ডপ দর্শনের ডিজিটাল সঙ্গী।</p>
              <div className="hero-actions mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/guide" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#B52A22] px-6 py-3.5 text-sm font-bold text-[#FFF9EF] shadow-[0_14px_32px_rgba(181,42,34,0.32)] transition-all hover:-translate-y-1 hover:bg-[#CE3B31] active:scale-[0.98]">Guide Me <ArrowUpRight size={17} /></Link>
                <a href="#timeline" className="inline-flex items-center justify-center gap-3 rounded-full border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-bold text-[#FFF9EF] backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/18 active:scale-[0.98]">দিনপঞ্জি দেখুন <ArrowDown size={16} /></a>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-[#FFF9EF]/70">
                <span className="flex items-center gap-2"><CalendarDays size={14} className="text-[#F8D36D]" /> ১০–২১ অক্টোবর ২০২৬</span>
                <span className="flex items-center gap-2"><Compass size={14} className="text-[#F8D36D]" /> পশ্চিমবঙ্গ জুড়ে</span>
              </div>
            </div>
            <div className="hero-sidecard relative ml-auto w-full max-w-[330px] rounded-[32px] border border-white/30 bg-[#FFF9EF]/12 p-3 shadow-2xl backdrop-blur-md lg:mb-3">
              <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-[#2A201A]">
                <img src="/durga-icon_c3c9fdb9.png" alt="Bengali Durga illustration" className="h-[290px] w-full object-cover opacity-90 mix-blend-screen" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2A201A] via-[#2A201A]/65 to-transparent p-5 pt-20">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F8D36D]"></p>
                  <p className="mt-1 font-serif text-xl font-bold">জয় মা দুর্গা</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.17em] text-[#FFF9EF]/65"><span>vol. 01</span><span>শুভারম্ভ</span></div>
            </div>
          </div>
          <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFF9EF]/60 sm:flex"><span>স্ক্রল করুন</span><span className="h-10 w-px bg-gradient-to-b from-[#FFF9EF]/70 to-transparent" /></div>
        </section>

        <section id="ma" className="relative overflow-hidden bg-[#F8F1E4] py-24 sm:py-32 lg:py-40">
          {/* Subtle decorative background alpona circles */}
          <div className="pointer-events-none absolute -left-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full border border-[#E5A62C]/25 [background-image:radial-gradient(circle,rgba(229,166,44,0.12)_0%,transparent_70%)]" />
          <div className="pointer-events-none absolute -right-24 top-1/3 h-[500px] w-[500px] rounded-full border border-[#B52A22]/15 [background-image:radial-gradient(circle,rgba(181,42,34,0.08)_0%,transparent_70%)]" />

          <div className="container relative z-10 grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            {/* Left Narrative Column */}
            <div className="reveal-left max-w-xl">
              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5A62C]/45 bg-[#FFF4D7] px-4 py-1.5 shadow-sm">
                <Sparkles size={14} className="text-[#B52A22]" />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#B52A22]">
                  বাংলার শ্রেষ্ঠ উৎসব · The Grand Festival of Bengal
                </span>
              </div>

              <h2 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.96] tracking-[-0.05em] text-[#2A201A]">
                মা আসছেন ...<br />
                <br />
                <span className="text-[#B52A22]">শারদীয়ার এই উৎসবে, মন হোক আনন্দে ভরা।।</span>
              </h2>

              <p className="mt-6 text-base sm:text-lg font-medium leading-relaxed text-[#2A201A]/90">
                <strong className="font-serif text-[#B52A22]">Durga Puja is the best festival of West Bengal</strong> — বাঙালির শ্রেষ্ঠ আনন্দ, আত্মার উৎসব আর মিলনের মহাতীর্থ।
              </p>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6B574C]">
                মা দুর্গা কেবল দশভুজা অসুরমর্দিনী নন; তিনি বাঙালির ঘরের আদরের মেয়ে উমা। বছর ঘুরে শরৎকালে তিনি আসেন হিমালয় থেকে মাটির ঘরে, সঙ্গে নিয়ে আসেন আশীর্বাদ, সমৃদ্ধি আর অফুরান ভালোবাসা। কাশীফুলের দোলা, ঢাকের গুরুগুরু আওয়াজ আর শিউলির গন্ধে আকাশ-বাতাস ভরে ওঠে মায়ের আগমনে।
              </p>

              {/* 3 Core Highlights */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3 border-t border-[#B52A22]/15 pt-6">
                <div className="rounded-2xl border border-[#B52A22]/10 bg-[#FFF9EF]/80 p-3.5 shadow-sm">
                  <p className="font-serif text-2xl font-black text-[#B52A22]">১০</p>
                  <p className="mt-1 text-xs font-bold text-[#2A201A]">দশভুজায় মহাশক্তি</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-[#80675A]">অশুভের বিনাশ ও শক্তির প্রতীক</p>
                </div>
                <div className="rounded-2xl border border-[#B52A22]/10 bg-[#FFF9EF]/80 p-3.5 shadow-sm">
                  <p className="font-serif text-2xl font-black text-[#E5A62C]">ইউনেস্কো</p>
                  <p className="mt-1 text-xs font-bold text-[#2A201A]">বিশ্ব ঐতিহ্যের স্বীকৃতি</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-[#80675A]">সাংস্কৃতিক ঐক্যের মহোৎসব</p>
                </div>
                <div className="rounded-2xl border border-[#B52A22]/10 bg-[#FFF9EF]/80 p-3.5 shadow-sm">
                  <p className="font-serif text-2xl font-black text-[#B52A22]">১</p>
                  <p className="mt-1 text-xs font-bold text-[#2A201A]">মা সবার</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-[#80675A]">সকল ভেদাভেদ ভুলে মহামিলন</p>
                </div>
              </div>
            </div>

            {/* Right Visual Column — Grand Cosmic Durga Showcase */}
            <div className="reveal-right relative flex items-center justify-center">
              {/* Outer Golden Aura Glow */}
              <div className="pointer-events-none absolute h-[95%] w-[95%] rounded-[40px] bg-[#E5A62C]/20 blur-3xl" />

              {/* Main Artwork Container with Ornate Frame */}
              <div className="group relative overflow-hidden rounded-[32px] sm:rounded-[42px] border-2 border-[#E5A62C]/50 bg-[#2A201A] p-2 shadow-[0_28px_80px_rgba(91,47,28,0.28)] transition-all duration-700 hover:border-[#E5A62C] hover:shadow-[0_32px_90px_rgba(229,166,44,0.32)]">
                <div className="relative overflow-hidden rounded-[26px] sm:rounded-[36px]">
                  <img
                    src="/cosmic-durga-editorial_e418a639.webp"
                    alt="Cosmic Divine Portrait of Durga Ma — The Heart of West Bengal"
                    className="h-auto max-h-[580px] w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Overlay for bottom caption */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Floating Sacred Ceremonial Badges */}
                  <div className="absolute left-4 top-4 sm:left-6 sm:top-6 flex items-center gap-2 rounded-full border border-[#E5A62C]/50 bg-[#2A201A]/85 px-4 py-1.5 backdrop-blur-md shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-[#E5A62C] animate-ping" />
                    <span className="font-serif text-xs sm:text-sm font-bold text-[#F8D36D]">
                      দশভুজা মহামায়া
                    </span>
                  </div>

                  <div className="absolute right-4 top-4 sm:right-6 sm:top-6 grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full border-2 border-[#E5A62C]/60 bg-[#B52A22]/90 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-[#FFF9EF] shadow-xl backdrop-blur-md transition-transform duration-500 group-hover:rotate-12">
                    <span>শক্তি<br />স্নেহ<br />শান্তি</span>
                  </div>

                  {/* Bottom Text Ribbon */}
                  <div className="absolute bottom-5 inset-x-5 sm:bottom-6 sm:inset-x-6 rounded-[22px] border border-white/20 bg-black/55 p-4 backdrop-blur-md sm:p-5 text-white">
                    <p className="font-serif text-xl sm:text-2xl font-bold leading-tight text-[#FFF9EF]">
                      &ldquo;মায়ের স্নেহে আলোকিত সারা বাংলা&rdquo;
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-[#F8D36D] font-medium">
                      Celebrating Bengal&apos;s Soul & Heritage
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="timeline" className="relative overflow-hidden bg-[#2A201A] py-24 text-[#FFF9EF] sm:py-32">
          <div className="absolute inset-0 opacity-30 [background-image:url('/alpona-paper-texture_bd9c7e11.webp')] [background-size:cover] mix-blend-screen" />
          <div className="container relative z-10">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.72fr]">
              <div className="reveal-left">
                <p className="section-kicker text-[#F8D36D]">পুজোর দিনপঞ্জি · ২০২৬</p>
                <h2 className="mt-4 max-w-[10ch] font-serif text-5xl font-black leading-[0.91] tracking-[-0.05em] text-[#FFF9EF] sm:text-7xl">আলোর দিন গুনে রাখুন।</h2>
              </div>
              <div className="reveal-right lg:justify-self-end"><Countdown /></div>
            </div>

            <div className="timeline-wrap relative mt-20 max-w-5xl lg:ml-[8%]">
              <div className="absolute bottom-5 left-[13px] top-3 w-px bg-[#FFF9EF]/15 sm:left-[18px]" />
              <div className="timeline-line absolute bottom-5 left-[13px] top-3 w-px bg-[#E5A62C] sm:left-[18px]" />
              <div className="space-y-7 sm:space-y-9">
                {PUJA_TIMELINE.map((day, index) => (
                  <article key={day.title} className="reveal relative grid grid-cols-[32px_1fr] gap-5 sm:grid-cols-[40px_1fr] sm:gap-7">
                    <div className="relative z-10 mt-1 grid h-7 w-7 place-items-center rounded-full border border-[#E5A62C] bg-[#2A201A] text-[10px] font-black text-[#F8D36D] sm:h-9 sm:w-9">{toBengaliNumber(index + 1)}</div>
                    <div className="grid gap-5 border-b border-white/10 pb-7 sm:grid-cols-[0.65fr_1fr] sm:items-start sm:gap-12">
                      <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F8D36D]">{day.eyebrow}</p><h3 className="mt-2 font-serif text-3xl font-bold text-[#FFF9EF] sm:text-4xl">{day.title}</h3></div>
                      <div><p className="font-serif text-lg text-[#FFF9EF]/88">{day.date}</p><p className="mt-2 text-sm leading-6 text-[#FFF9EF]/58">{day.note}</p></div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Gallery />

        <section id="guide" className="relative bg-[#E9E0C9] py-24 sm:py-32">
          <div className="container">
            <div className="mb-10 grid gap-7 lg:grid-cols-[1fr_0.7fr] lg:items-end">
              <div className="reveal-left"><p className="section-kicker text-[#B52A22]">হারিয়ে যাবেন না</p><h2 className="mt-4 max-w-[10ch] font-serif text-5xl font-black leading-[0.9] tracking-[-0.06em] text-[#2A201A] sm:text-7xl">প্যান্ডেল ঘোরা, এবার বোধনের সঙ্গে।</h2></div>
              <div className="reveal-right lg:justify-self-end"><p className="max-w-md text-[16px] leading-7 text-[#6B574C]">আপনার আশেপাশের প্যান্ডেল, রেল–বাস–অটো সংযোগ, আর সন্ধ্যার সহজ রুট — এক জায়গায়। বিস্তারিত গাইড খুলে পছন্দের গন্তব্য থেকে শুরু করুন।</p><Link href="/guide" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2A201A] px-5 py-3 text-sm font-bold text-[#FFF9EF] transition-all hover:-translate-y-1 hover:bg-[#B52A22] active:scale-[0.98]">Guide Me <MapPinned size={16} /></Link></div>
            </div>
            <div className="reveal"><PandalMap showMap={false} /></div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#E9DDC7] py-24 text-[#2A201A] sm:py-32">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-[#B52A22]/22 sm:h-[460px] sm:w-[460px]" /><div className="absolute -right-6 -top-10 h-52 w-52 rounded-full border border-[#B52A22]/16 sm:h-[330px] sm:w-[330px]" />
          <div className="container relative z-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            <div className="reveal-left"><p className="section-kicker text-[#B52A22]">শেষ পাতা · the last light</p><h2 className="mt-4 max-w-[10ch] font-serif text-5xl font-black leading-[0.9] tracking-[-0.06em] text-[#2A201A] sm:text-7xl">এই শরৎ, পথে নামুন।</h2><p className="mt-7 max-w-md text-base leading-7 text-[#6B574C]">মহালয়ার ভোর থেকে বিজয়ার বিকেল — বোধন থাকুক আপনার পাশে। পুজোর দিন, গন্তব্য আর transit একসঙ্গে দেখে বেরিয়ে পড়ুন।</p><div className="mt-8 flex items-center gap-3 text-sm font-semibold text-[#B52A22]"><Sparkles size={18} /> see you under the lights</div></div>
            <div className="reveal-right flex min-h-[290px] flex-col justify-between rounded-[34px] border border-[#B52A22]/15 bg-[#FFF9EF]/72 p-6 shadow-[0_18px_52px_rgba(91,47,28,0.10)] backdrop-blur-sm sm:p-8">
              <div><p className="section-kicker text-[#B52A22]">your puja route</p><h3 className="mt-4 max-w-[10ch] font-serif text-4xl font-black leading-[0.94] text-[#2A201A]">শহরের আলোয় দেখা হবে।</h3><p className="mt-4 max-w-sm text-sm leading-6 text-[#6B574C]">আপনার প্রথম destination বেছে নিন, transit দেখে নিন, আর ভিড়ের আগে বেরিয়ে পড়ুন।</p></div>
              <Link href="/guide" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B52A22] px-5 py-3.5 text-sm font-black text-[#FFF9EF] transition-all hover:-translate-y-1 hover:bg-[#90231D] active:scale-[0.98]">Guide Me <MapPinned size={17} /></Link>
            </div>
          </div>
        </section>
      </main>
      <AudioDock />
      <footer className="bg-[#2A201A] py-10 text-[#FFF9EF] sm:py-14">
        <div className="container flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a href="#top" className="flex items-center gap-3">
              <BrandMark size="md" />
              <span>
                <span className="block font-serif text-2xl font-bold">বোধন</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#F8D36D]">শরৎ ২০২৬</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#FFF9EF]/65">মায়ের আগমনের গল্প, আপনার শহরের পথে।</p>
            <div className="mt-4">
              <VisitorCount />
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-[#FFF9EF]/65 sm:items-end">
            <a href="mailto:arkokundu.tech@gmail.com" className="transition-colors hover:text-[#F8D36D]">arkokundu.tech@gmail.com</a>
            <a href="tel:+917439817750" className="transition-colors hover:text-[#F8D36D]">7439817750</a>
            <p className="pt-3 text-xs text-[#FFF9EF]/35">© ২০২৬ বোধন · শুভ শারদীয়া</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
