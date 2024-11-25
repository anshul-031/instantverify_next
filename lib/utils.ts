import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { headers } from 'next/headers';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDomainUrl(req?: Request): string {
  let domain: string;
  let protocol: string;

  if (req) {
    // Client-side or API routes
    domain = req.headers.get("host") || "instantverify.in";
    protocol = domain.includes("localhost") ? "http" : "https";
  } else {
    // Server-side
    const headersList = headers();
    domain = headersList.get("host") || "instantverify.in";
    protocol = domain.includes("localhost") ? "http" : "https";
  }

  return `${protocol}://${domain}`;
}