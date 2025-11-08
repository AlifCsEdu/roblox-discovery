import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) {
    return 'N/A';
  }
  return `${rating.toFixed(1)}%`;
}

export function getGenreColor(color: string): string {
  return `bg-${color} text-white`;
}
