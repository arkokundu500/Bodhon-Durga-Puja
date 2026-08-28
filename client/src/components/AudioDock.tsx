// Bodhon visual reminder: Bodhon Radio is a tactile paper record sleeve — gliding covers, brass-alpona details, and vermilion playback controls.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import gsap from "gsap";
import { TRACKS, useBodhonStore, type Track } from "@/lib/bodhon-data";
import { trpc } from "@/lib/trpc";

export function AudioDock() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const reelSpinRef = useRef<gsap.core.Tween | null>(null);
  const { activeTrackId, isPlaying, setActiveTrack, setIsPlaying } = useBodhonStore();
  const { data: storedMedia } = trpc.media.list.useQuery(undefined, { staleTime: 60_000 });
  const tracks = useMemo<Track[]>(() => {
    const audioAssets = (storedMedia ?? []).filter((asset) => asset.kind === "audio");
    if (!audioAssets.length) return TRACKS;
    return audioAssets.map((asset) => {
      const baseId = asset.slug.replace(/-audio$/, "");
      const fallback = TRACKS.find((track) => track.id === baseId);
      const cover = storedMedia?.find((item) => item.kind === "cover" && item.slug === `${baseId}-cover`);
      return { id: baseId, title: asset.title, subtitle: asset.subtitle, cover: cover?.url ?? fallback?.cover ?? "", src: asset.url };
    });
  }, [storedMedia]);
  const activeIndex = Math.max(tracks.findIndex((track) => track.id === activeTrackId), 0);
  const activeTrack = tracks[activeIndex] ?? TRACKS[0];
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useLayoutEffect(() => {
    const reel = reelRef.current;
    if (!reel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    reelSpinRef.current = gsap.to(reel, { rotation: "+=360", duration: 5, repeat: -1, ease: "none", paused: !isPlaying, transformOrigin: "50% 50%" });
    return () => { reelSpinRef.current?.kill(); reelSpinRef.current = null; };
  }, []);

  useEffect(() => {
    const spin = reelSpinRef.current;
    if (!spin) return;
    if (isPlaying) spin.play(); else spin.pause();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = activeTrack.src;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [activeTrack.src, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false)); else audio.pause();
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    const activeCard = railRef.current?.querySelector(`[data-track-id="${activeTrack.id}"]`);
    activeCard?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeTrack.id]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };
  const selectTrack = (index: number) => setActiveTrack(tracks[(index + tracks.length) % tracks.length].id);
  const seek = (value: number) => { if (audioRef.current) { audioRef.current.currentTime = value; setCurrentTime(value); } };

  return (
    <section id="music" className="border-t border-[#B52A22]/10 bg-[#EFE2CF] py-10 sm:py-14">
      <div className="container">
        <div className="flex flex-col gap-6 border-b border-[#B52A22]/10 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker text-[#B52A22]">বোধনের সুর · Bodhon Radio</p><h2 className="mt-3 font-serif text-4xl font-black leading-none text-[#2A201A] sm:text-5xl">Play something for the journey.</h2></div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#80675A]"><span className={`h-2 w-2 rounded-full ${isPlaying ? "animate-pulse bg-[#B52A22]" : "bg-[#B9A48D]"}`} /> {isPlaying ? "Now playing" : "Ready when you are"}</div></div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="flex gap-5 rounded-[30px] border border-[#B52A22]/12 bg-[#FFF9EF]/78 p-4 shadow-[0_18px_50px_rgba(91,47,28,0.08)] sm:p-5"><div className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full border-[7px] border-[#2A201A] bg-[#2A201A] shadow-[0_12px_28px_rgba(42,32,26,0.24)] sm:h-36 sm:w-36"><div ref={reelRef} className="absolute inset-1.5 rounded-full border border-[#FFF9EF]/20 bg-[repeating-radial-gradient(circle_at_center,#382B23_0,#382B23_2px,#211914_3px,#211914_6px)]"><img src={activeTrack.cover} alt="" className="absolute inset-[24%] h-[52%] w-[52%] rounded-full border-2 border-[#F5C85B] object-cover" /><span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F5C85B] bg-[#B52A22] shadow-[0_0_0_3px_#2A201A]" /><span className="absolute left-1/2 top-[7%] h-[10%] w-1 -translate-x-1/2 rounded-full bg-[#F5C85B]/75" /><span className="absolute bottom-[7%] left-1/2 h-[10%] w-1 -translate-x-1/2 rounded-full bg-[#F5C85B]/75" /><span className="absolute left-[7%] top-1/2 h-1 w-[10%] -translate-y-1/2 rounded-full bg-[#F5C85B]/75" /><span className="absolute right-[7%] top-1/2 h-1 w-[10%] -translate-y-1/2 rounded-full bg-[#F5C85B]/75" /></div><span className="absolute bottom-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-[#FFF9EF]/90 text-[#B52A22] backdrop-blur"><span className={`h-2 w-2 rounded-full ${isPlaying ? "animate-pulse bg-current" : "bg-[#B9A48D]"}`} /></span></div><div className="flex min-w-0 flex-1 flex-col justify-between py-1"><div><p className="section-kicker text-[#B52A22]">Selected track</p><h3 className="mt-2 truncate font-serif text-2xl font-bold text-[#2A201A] sm:text-3xl">{activeTrack.title}</h3><p className="mt-1 truncate text-sm text-[#80675A]">{activeTrack.subtitle}</p></div><div className="mt-5"><input aria-label="Seek through track" type="range" min="0" max={duration || 1} step="1" value={Math.min(currentTime, duration || 1)} onChange={(event) => seek(Number(event.target.value))} className="h-1.5 w-full accent-[#B52A22]" /><div className="mt-2 flex justify-between text-[10px] font-bold text-[#A08A77]"><span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}</span><span>{duration ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}` : "--:--"}</span></div></div></div></div>
          <div className="relative min-w-0"><div ref={railRef} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2">{tracks.map((track, index) => <button type="button" data-track-id={track.id} key={track.id} onClick={() => setActiveTrack(track.id)} className={`group flex min-w-[78%] snap-center items-center gap-3 rounded-[24px] border p-3 text-left transition-all duration-300 sm:min-w-[44%] ${track.id === activeTrackId ? "border-[#B52A22] bg-[#B52A22] text-[#FFF9EF] shadow-[0_12px_26px_rgba(181,42,34,0.15)]" : "border-[#B52A22]/10 bg-[#FFF9EF]/72 text-[#2A201A] hover:-translate-y-1 hover:border-[#E5A62C]"}`}><img src={track.cover} alt="" className="h-16 w-16 rounded-[16px] object-cover" /><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] opacity-65">Track 0{index + 1}</span><span className="mt-1 block truncate font-serif text-lg font-bold">{track.title}</span><span className="mt-0.5 block truncate text-xs opacity-65">{track.subtitle}</span></span><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-current/20 text-xs opacity-80 transition-transform group-hover:translate-x-0.5">↗</span></button>)}</div><p className="mt-2 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-[#A08A77]">Swipe to browse · tap a cover to play</p></div>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:justify-start"><button type="button" onClick={() => selectTrack(activeIndex - 1)} aria-label="Previous track" className="grid h-10 w-10 place-items-center rounded-full border border-[#B52A22]/15 bg-[#FFF9EF] text-[#2A201A] transition hover:-translate-y-0.5 hover:text-[#B52A22] active:scale-95"><SkipBack size={16} fill="currentColor" /></button><button type="button" onClick={toggle} aria-label={isPlaying ? "Pause music" : "Play music"} className="grid h-12 w-12 place-items-center rounded-full bg-[#B52A22] text-[#FFF9EF] shadow-[0_10px_24px_rgba(181,42,34,0.2)] transition hover:-translate-y-0.5 active:scale-95">{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}</button><button type="button" onClick={() => selectTrack(activeIndex + 1)} aria-label="Next track" className="grid h-10 w-10 place-items-center rounded-full border border-[#B52A22]/15 bg-[#FFF9EF] text-[#2A201A] transition hover:-translate-y-0.5 hover:text-[#B52A22] active:scale-95"><SkipForward size={16} fill="currentColor" /></button><button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute" : "Mute"} className="ml-1 grid h-10 w-10 place-items-center rounded-full border border-[#B52A22]/15 bg-[#FFF9EF] text-[#80675A] transition hover:-translate-y-0.5 hover:text-[#B52A22] active:scale-95">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button><span className="ml-2 text-xs font-semibold text-[#80675A]">{activeTrack.title} · {activeTrack.subtitle}</span></div>
        <audio ref={audioRef} muted={muted} preload="metadata" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => selectTrack(activeIndex + 1)} />
      </div>
    </section>
  );
}
