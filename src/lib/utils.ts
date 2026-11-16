import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Łączy klasy Tailwind CSS, eliminując konflikty (np. px-2 z px-4).
 * Używana we wszystkich komponentach UI do elastycznego stylowania propsów className.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
