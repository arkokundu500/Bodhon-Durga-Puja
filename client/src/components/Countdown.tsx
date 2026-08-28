// Bodhon visual reminder: countdown is a calm ritual card; vermilion digits on cream paper with small brass alpona cues.
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const TARGET = dayjs("2026-10-10T06:00:00+05:30");

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(): Remaining {
  const diff = Math.max(TARGET.diff(dayjs()), 0);
  const value = dayjs.duration(diff);
  return {
    days: Math.floor(value.asDays()),
    hours: value.hours(),
    minutes: value.minutes(),
    seconds: value.seconds(),
  };
}

const bn = (value: number) => String(value).padStart(2, "0").replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

export function Countdown() {
  const [remaining, setRemaining] = useState<Remaining>(() => getRemaining());
  const isPast = useMemo(() => TARGET.isBefore(dayjs()), []);

  useEffect(() => {
    if (isPast) return;
    const interval = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(interval);
  }, [isPast]);

  return (
    <div className="countdown-card rounded-[30px] border border-[#B52A22]/12 bg-[#FFF9EF]/86 p-5 shadow-[0_18px_50px_rgba(91,47,28,0.12)] backdrop-blur-lg sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker text-[#B52A22]">মহালয়ার আগে</p>
          <h3 className="mt-2 font-serif text-2xl font-bold leading-none text-[#2A201A]">আর কত রাত?</h3>
        </div>
        <span className="alpona-ring grid h-11 w-11 place-items-center rounded-full border border-[#E5A62C]/70 text-xs font-black text-[#B52A22]">আসছে</span>
      </div>
      {isPast ? (
        <p className="font-serif text-lg text-[#B52A22]">মায়ের আগমন হয়ে গেছে — শুভ মহালয়া।</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            [remaining.days, "দিন"],
            [remaining.hours, "ঘণ্টা"],
            [remaining.minutes, "মিনিট"],
            [remaining.seconds, "সেকেন্ড"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-[#F3E7D5] px-2 py-3 text-center sm:px-3">
              <div className="font-serif text-2xl font-black tabular-nums text-[#B52A22] sm:text-3xl">{bn(Number(value))}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#80675A]">{label}</div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs font-medium leading-5 text-[#80675A]">শুরু: শনিবার, ১০ অক্টোবর ২০২৬ · সকাল ৬টা</p>
    </div>
  );
}
