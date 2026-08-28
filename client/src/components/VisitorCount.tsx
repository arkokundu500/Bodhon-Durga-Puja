import { useEffect, useRef, useState } from "react";
import { Users } from "lucide-react";
import { trpc } from "@/lib/trpc";

const toBengaliNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

export function VisitorCount({ className = "" }: { className?: string }) {
  const recordedRef = useRef(false);
  const recordVisitMutation = trpc.visitor.recordVisit.useMutation();

  // Query live count from server, polling every 10 seconds for live updates
  const visitorQuery = trpc.visitor.stats.useQuery(undefined, {
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const [displayCount, setDisplayCount] = useState<number | null>(null);

  // Record visitor count once per session on the backend
  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;

    try {
      const sessionKey = "bodhon_visit_logged";
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "true");
        recordVisitMutation.mutate(undefined, {
          onSuccess: (data) => {
            if (data?.count) {
              setDisplayCount(data.count);
            }
          },
        });
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [recordVisitMutation]);

  // Sync display count when query updates
  useEffect(() => {
    if (visitorQuery.data?.count) {
      setDisplayCount(visitorQuery.data.count);
    }
  }, [visitorQuery.data?.count]);

  const count = displayCount ?? visitorQuery.data?.count ?? 25;

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border border-[#E5A62C]/30 bg-[#FFF9EF]/10 px-3.5 py-1.5 backdrop-blur-md transition-all hover:border-[#E5A62C]/60 hover:bg-[#FFF9EF]/15 ${className}`}
      title="Live celebration visitor count for Durga Puja 2026"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E5A62C] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F5C85B]" />
      </span>
      <Users size={14} className="text-[#F8D36D]" />
      <span className="text-xs font-semibold text-[#FFF9EF]/85 tracking-wide">
        <span className="font-serif font-bold text-[#F8D36D]">
          {toBengaliNumber(count.toLocaleString("en-IN"))}
        </span>{" "}
        <span className="opacity-80">লাইভ দর্শনার্থী · Live Visitors</span>
      </span>
    </div>
  );
}
