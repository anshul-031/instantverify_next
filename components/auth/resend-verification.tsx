"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ResendVerificationProps {
  email: string;
  onSuccess?: () => void;
}

export function ResendVerification({ email, onSuccess }: ResendVerificationProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend verification email");
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="link"
      className="mt-2 px-0"
      onClick={handleResend}
      disabled={loading}
    >
      {loading ? "Sending..." : "Resend verification email"}
    </Button>
  );
}