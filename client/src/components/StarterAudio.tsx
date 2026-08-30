import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { useBodhonStore } from "@/lib/bodhon-data";

const STARTER_AUDIO_SRC = "/pujar-badya-dhak.mp3";
const STARTER_DURATION_SECONDS = 20;

export function StarterAudio() {
  const isBodhonRadioPlaying = useBodhonStore((state) => state.isPlaying);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(STARTER_DURATION_SECONDS);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(STARTER_AUDIO_SRC);
    audio.preload = "auto";
    audioRef.current = audio;

    const startPlayback = async () => {
      if (hasStartedRef.current || useBodhonStore.getState().isPlaying) return;
      hasStartedRef.current = true;

      try {
        await audio.play();
        setActive(true);

        // Start countdown timer for exactly 20 seconds
        let remaining = STARTER_DURATION_SECONDS;
        timerRef.current = setInterval(() => {
          remaining -= 1;
          setSecondsLeft(remaining);
          if (remaining <= 0) {
            stopPlayback();
          }
        }, 1000);
      } catch {
        // Autoplay blocked by browser policy; wait for first user interaction
        const handleFirstInteraction = async () => {
          window.removeEventListener("click", handleFirstInteraction);
          window.removeEventListener("keydown", handleFirstInteraction);
          window.removeEventListener("touchstart", handleFirstInteraction);

          if (useBodhonStore.getState().isPlaying) return;

          try {
            await audio.play();
            setActive(true);

            let rem = STARTER_DURATION_SECONDS;
            timerRef.current = setInterval(() => {
              rem -= 1;
              setSecondsLeft(rem);
              if (rem <= 0) {
                stopPlayback();
              }
            }, 1000);
          } catch {
            // ignore if still blocked
          }
        };

        window.addEventListener("click", handleFirstInteraction, { once: true });
        window.addEventListener("keydown", handleFirstInteraction, { once: true });
        window.addEventListener("touchstart", handleFirstInteraction, { once: true });
      }
    };

    const stopPlayback = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setActive(false);
    };

    // Start on mount / reload
    startPlayback();

    return () => {
      stopPlayback();
    };
  }, []);

  // If Bodhon Radio starts playing, immediately stop starter audio
  useEffect(() => {
    if (isBodhonRadioPlaying && active) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setActive(false);
    }
  }, [isBodhonRadioPlaying, active]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !muted;
    audioRef.current.muted = nextMuted;
    setMuted(nextMuted);
  };

  const handleDismiss = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActive(false);
  };

  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-5 z-40 flex items-center gap-3 rounded-full border border-[#E5A62C]/60 bg-[#2A201A]/90 px-4 py-2 text-[#FFF9EF] shadow-[0_16px_36px_rgba(42,32,26,0.35)] backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Animated Sound Wave Bars */}
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-3 w-1 rounded-full bg-[#E5A62C] animate-pulse" />
        <span className="h-4 w-1 rounded-full bg-[#F5C85B] animate-pulse delay-75" />
        <span className="h-2.5 w-1 rounded-full bg-[#E5A62C] animate-pulse delay-150" />
      </span>

      <div className="flex items-center gap-2">
        <span className="font-serif text-xs sm:text-sm font-bold text-[#F8D36D]">
          পুজোর বাদ্য
        </span>
        <span className="rounded-full bg-[#FFF9EF]/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-[#FFF9EF]/80">
          {secondsLeft}s
        </span>
      </div>

      <div className="flex items-center gap-1 border-l border-white/20 pl-2">
        <button
          type="button"
          onClick={toggleMute}
          className="grid h-7 w-7 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label={muted ? "Unmute starter music" : "Mute starter music"}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#F8D36D]" />}
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="grid h-7 w-7 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss starter music"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
