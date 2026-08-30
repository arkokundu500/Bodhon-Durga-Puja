import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X, Sparkles } from "lucide-react";
import { useBodhonStore } from "@/lib/bodhon-data";

const STARTER_AUDIO_SRC = "/pujar-badya-dhak.mp3";
const STARTER_DURATION_SECONDS = 20;

export function StarterAudio() {
  const isBodhonRadioPlaying = useBodhonStore((state) => state.isPlaying);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPendingAutoplay, setIsPendingAutoplay] = useState(false);
  const [muted, setMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(STARTER_DURATION_SECONDS);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasTriggeredRef = useRef(false);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    let rem = STARTER_DURATION_SECONDS;
    setSecondsLeft(rem);
    timerRef.current = setInterval(() => {
      rem -= 1;
      setSecondsLeft(rem);
      if (rem <= 0) {
        stopPlayback();
      }
    }, 1000);
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
    setIsPlaying(false);
    setIsPendingAutoplay(false);
  };

  const playAudio = async () => {
    if (!audioRef.current) return;
    if (useBodhonStore.getState().isPlaying) return;

    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setIsPlaying(true);
      setIsPendingAutoplay(false);
      startCountdown();
    } catch {
      // Browser blocked autoplay without user gesture; show prompt & listen for first interaction
      setIsPendingAutoplay(true);
      setIsPlaying(false);

      const handleUserGesture = async () => {
        ["click", "pointerdown", "touchstart", "scroll", "keydown"].forEach((evt) => {
          window.removeEventListener(evt, handleUserGesture);
        });

        if (useBodhonStore.getState().isPlaying) return;

        try {
          if (audioRef.current) {
            await audioRef.current.play();
            setIsPlaying(true);
            setIsPendingAutoplay(false);
            startCountdown();
          }
        } catch {
          // ignore
        }
      };

      ["click", "pointerdown", "touchstart", "scroll", "keydown"].forEach((evt) => {
        window.addEventListener(evt, handleUserGesture, { once: true, passive: true });
      });
    }
  };

  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Small delay to let DOM mount and audio element initialize
    const t = setTimeout(() => {
      playAudio();
    }, 150);

    return () => {
      clearTimeout(t);
      stopPlayback();
    };
  }, []);

  // Stop starter audio if Bodhon Radio starts
  useEffect(() => {
    if (isBodhonRadioPlaying && (isPlaying || isPendingAutoplay)) {
      stopPlayback();
    }
  }, [isBodhonRadioPlaying, isPlaying, isPendingAutoplay]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const nextMuted = !muted;
    audioRef.current.muted = nextMuted;
    setMuted(nextMuted);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopPlayback();
  };

  const handleManualPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playAudio();
  };

  return (
    <>
      {/* Hidden native audio tag */}
      <audio
        ref={audioRef}
        src={STARTER_AUDIO_SRC}
        preload="auto"
        playsInline
        onEnded={stopPlayback}
      />

      {/* Floating Celebration Starter Pill */}
      {(isPlaying || isPendingAutoplay) && (
        <div
          role="status"
          aria-live="polite"
          onClick={isPendingAutoplay ? handleManualPlay : undefined}
          className={`fixed bottom-5 left-4 sm:left-6 z-40 flex items-center gap-3 rounded-full border border-[#E5A62C]/60 bg-[#2A201A]/95 px-4 py-2.5 text-[#FFF9EF] shadow-[0_16px_36px_rgba(42,32,26,0.4)] backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            isPendingAutoplay ? "cursor-pointer ring-2 ring-[#E5A62C] hover:scale-105" : ""
          }`}
        >
          {isPlaying ? (
            /* Animated Sound Wave */
            <span className="flex items-center gap-1" aria-hidden="true">
              <span className="h-3 w-1 rounded-full bg-[#E5A62C] animate-pulse" />
              <span className="h-4 w-1 rounded-full bg-[#F5C85B] animate-pulse delay-75" />
              <span className="h-2.5 w-1 rounded-full bg-[#E5A62C] animate-pulse delay-150" />
            </span>
          ) : (
            <Sparkles size={16} className="animate-spin text-[#F8D36D]" />
          )}

          <div className="flex items-center gap-2">
            <span className="font-serif text-xs sm:text-sm font-bold text-[#F8D36D]">
              {isPlaying ? "পুজোর বাদ্য বাজছে" : "পুজোর ঢাকের আওয়াজ শুনতে ক্লিক করুন"}
            </span>
            {isPlaying && (
              <span className="rounded-full bg-[#FFF9EF]/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-[#FFF9EF]/85">
                {secondsLeft}s
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 border-l border-white/20 pl-2">
            {isPlaying && (
              <button
                type="button"
                onClick={toggleMute}
                className="grid h-7 w-7 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label={muted ? "Unmute starter music" : "Mute starter music"}
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#F8D36D]" />}
              </button>
            )}

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
      )}
    </>
  );
}
