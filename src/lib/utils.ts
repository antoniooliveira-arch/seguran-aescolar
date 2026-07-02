import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateCallNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `NISE-${year}${random}`;
}
