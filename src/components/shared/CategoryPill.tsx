import React from "react";
import { cn } from "@/lib/utils";

export interface CategoryPillProps {
  category: string;
  isCosmic?: boolean;
  className?: string;
}

/**
 * Zwraca znormalizowany kod sektora w stylu technicznym (np. IT -> IT_SOFTWARE, stolarstwo -> STOLARSTWO).
 */
function getCosmicCategoryLabel(cat: string): string {
  const c = cat.toLowerCase().trim();
  if (c.includes("it") || c.includes("python") || c.includes("dev")) return "IT_SOFTWARE";
  if (c.includes("stolar")) return "STOLARSTWO";
  if (c.includes("detail") || c.includes("auto")) return "CAR_DETAILING";
  if (c.includes("market")) return "MARKETING";
  if (c.includes("hand") || c.includes("sprzed")) return "HANDEL_B2B";
  return c.toUpperCase().replace(/\s+/g, "_");
}

/**
 * Zwraca kolor akcentu dla danego sektora.
 */
function getCategoryColor(cat: string, isCosmic: boolean): { textColor: string; badgeClasses: string } {
  const c = cat.toLowerCase().trim();

  if (c.includes("it") || c.includes("python") || c.includes("dev")) {
    return {
      textColor: "text-cyan-400",
      badgeClasses: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
  }
  if (c.includes("stolar")) {
    return {
      textColor: "text-amber-400",
      badgeClasses: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }
  if (c.includes("detail") || c.includes("auto")) {
    return {
      textColor: "text-orange-400",
      badgeClasses: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    };
  }
  if (c.includes("market")) {
    return {
      textColor: "text-purple-400",
      badgeClasses: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };
  }
  if (c.includes("hand") || c.includes("sprzed")) {
    return {
      textColor: "text-emerald-400",
      badgeClasses: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
  }

  return {
    textColor: "text-zinc-400",
    badgeClasses: "bg-zinc-800 text-zinc-300 border-zinc-700",
  };
}

/**
 * Reużywalny komponent prezentacji branży/kategorii oferty.
 * W stylu Zinc: zaokrąglony badge z delikatnym tłem.
 * W stylu Kosmicznym: surowy prefix monospace `// SEKTOR`.
 */
export function CategoryPill({ category, isCosmic = false, className }: CategoryPillProps) {
  const { textColor, badgeClasses } = getCategoryColor(category, isCosmic);

  if (isCosmic) {
    const code = getCosmicCategoryLabel(category);
    return (
      <span className={cn("font-mono font-bold text-[11px] tracking-wider", textColor, className)}>
        // {code}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
        badgeClasses,
        className
      )}
    >
      {category}
    </span>
  );
}
