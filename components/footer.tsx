import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Shield className="h-6 w-6" />
          <p className="text-center text-sm leading-loose md:text-left">
            Built by InstantVerify.in. © {currentYear} All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <nav className="flex gap-4">
            <Link href="/privacy-policy" className="text-sm underline-offset-4 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="/contact" className="text-sm underline-offset-4 hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}