import React from "react";
import { cn } from "@/lib/utils";

export interface HudCvCounterProps {
  total: number;
  sent: number;
  className?: string;
}

/**
 * Pasek licznika wysłanych aplikacji CV.
 * Stylizowany z wyrazistym żółto-czarnym akcentem telemetrii rekrutacyjnej.
 */
export function HudCvCounter({ total, sent, className }: HudCvCounterProps) {
  return (
    <div
      className={cn(
        "p-3 border border-yellow-500/30 font-mono text-xs flex items-center shadow-[0_0_20px_rgba(234,179,8,0.12)] bg-[#09090c]/90 backdrop-blur-md",
        className
      )}
      style={{
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 text-xs font-black tracking-wider">WYSŁANE CV:</span>
        <span className="px-2.5 py-0.5 bg-yellow-400/15 text-yellow-300 font-black text-sm tracking-wider border border-yellow-400/40 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
          {sent}
        </span>
        <span className="text-zinc-600 font-bold">/</span>
        <span className="text-zinc-400 font-bold text-sm">{total}</span>
      </div>
    </div>
  );
}
