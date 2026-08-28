// Bodhon visual reminder: text-free vermilion third-eye mark, brass ring, premium Bengali editorial restraint.
import React, { useState } from "react";

type BrandMarkProps = { size?: "sm" | "md" | "lg" };

export function BrandMark({ size = "md" }: BrandMarkProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
  return (
    <span className={`${sizes[size]} relative inline-grid shrink-0 place-items-center rounded-full border border-[#E5A62C]/70 bg-[#F8F1E4]/80 text-[#B52A22] shadow-[0_6px_18px_rgba(91,47,28,0.12)]`} aria-hidden="true">
      <span className="absolute inset-[4px] rounded-full border border-[#B52A22]/35" />
      {!imageFailed && <img src="/bodhon-mark_e76aa373.webp" alt="" onError={() => setImageFailed(true)} className="relative z-10 h-[76%] w-[76%] object-contain" />}
      {imageFailed && <span className="relative z-10 h-6 w-3 rounded-full border-2 border-[#B52A22] bg-[#E5A62C]" />}
      <span className="absolute -bottom-[3px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[#B52A22] bg-[#E5A62C]" />
    </span>
  );
}
