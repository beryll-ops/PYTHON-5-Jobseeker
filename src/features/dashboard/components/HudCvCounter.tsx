import React from "react";
import { cn } from "@/lib/utils";

export interface HudCvCounterProps {
  total: number;
  sent: number;
  className?: string;
}

/**
 * Pasek licznika wysłanych aplikacji CV.
 * Prezentuje wyłącznie stan realizacji: WYSŁANE CV: X / Y.
 */
export function HudCvCounter({ total, sent, className }: HudCvCounterProps) {
  return (
    <div
      className={cn(
        "p-3 border border-indigo-500/30 font-mono text-xs flex items-center shadow-[0_0_20px_rgba(79,70,229,0.15)] bg-[#0a0e1c]/80 backdrop-blur-md",
        className
      )}
      style={{
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-white text-xs font-bold">WYSŁANE CV:</span>
        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-sm tracking-wider border border-emerald-500/40">
          {sent}
        </span>
        <span className="text-zinc-600 font-bold">/</span>
        <span className="text-zinc-400 font-bold text-sm">{total}</span>
      </div>
    </div>
  );
}
