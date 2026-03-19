import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Kenyan Shillings (KSh)
 */
export function formatKSh(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('KES', 'KSh');
}
import type { Timestamp } from "firebase/firestore";

/**
 * Safely converts a Firestore Timestamp or ISO date string to a JavaScript Date.
 * Use this instead of `as any` casts wherever orderDate / review.date can be
 * either a Timestamp or a plain string.
 */
export function toDate(value: Timestamp | string): Date {
  if (typeof value === 'string') {
    return new Date(value);
  }
  // Firestore Timestamp objects expose a toDate() method.
  if (value && typeof (value as Timestamp).toDate === 'function') {
    return (value as Timestamp).toDate();
  }
  return new Date(value as unknown as string);
}
