import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins conditional class names and resolves Tailwind conflicts so the last
 * one wins. This is the only sanctioned way to build a className string:
 * string concatenation bypasses conflict resolution and silently produces
 * broken output when a caller overrides a base class.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
