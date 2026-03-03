import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export const FREE_GENERATION_LIMIT = 5;

export function canGenerate(
  subscription: string,
  generationsThisMonth: number
): { allowed: boolean; reason?: string } {
  if (subscription === 'pro' || subscription === 'annual') {
    return { allowed: true };
  }
  if (generationsThisMonth >= FREE_GENERATION_LIMIT) {
    return {
      allowed: false,
      reason: `Free plan limit reached (${FREE_GENERATION_LIMIT}/month). Upgrade to Pro for unlimited generations.`,
    };
  }
  return { allowed: true };
}
