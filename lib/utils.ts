import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tier-based hover classes (pure CSS, no Framer Motion dependency)
export const tier1Hover =
  "hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/20 " +
  "hover:border-accent/50 transition-all duration-200 ease-out";
export const tier2Hover =
  "hover:-translate-y-0.5 hover:shadow-md hover:shadow-border/30 hover:border-border-strong transition-all duration-200";
export const tier3Hover =
  "hover:bg-border-light hover:border-border-strong/60 hover:text-text hover:translate-x-0.5 transition-all duration-150";
export const tier4Hover =
  "transition-colors duration-150";
export const tier5Hover =
  "transition-all duration-200";
export const tier6Hover = "hover:text-text-secondary transition-colors duration-150";
