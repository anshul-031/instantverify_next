'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              InstantVerify.in
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session ? (
              <>
                <Link href="/verify">
                  <Button
                    variant="ghost"
                    className="h-9 w-9 px-0 sm:h-10 sm:px-4 sm:w-auto"
                  >
                    <span className="hidden sm:inline-block">
                      Start Verification
                    </span>
                    <Shield className="h-5 w-5 sm:hidden" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="h-9">
                    Profile
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" className="h-9">
                    Settings
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="h-9">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="default"
                    className="h-9 bg-primary hover:bg-primary/90"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
