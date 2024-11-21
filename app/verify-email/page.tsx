"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
    }
  }, [token]);

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Shield className="h-12 w-12 text-primary" />
        </div>

        {status === "loading" && (
          <>
            <h1 className="mb-4 text-2xl font-bold">Verifying your email...</h1>
            <p className="text-muted-foreground">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h1 className="mb-4 text-2xl font-bold">Email Verified!</h1>
            <p className="mb-6 text-muted-foreground">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <Link href="/login">
              <Button className="w-full">Log In</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h1 className="mb-4 text-2xl font-bold">Verification Failed</h1>
            <p className="mb-6 text-muted-foreground">
              The verification link is invalid or has expired. Please try signing up again.
            </p>
            <Link href="/signup">
              <Button className="w-full" variant="outline">
                Back to Sign Up
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}