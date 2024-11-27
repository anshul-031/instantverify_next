"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface OtpVerificationProps {
  aadhaarNumber: string;
  onVerified: () => void;
}

export function OtpVerification({ aadhaarNumber, onVerified }: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const generateOtp = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/verify/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaarNumber }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate OTP");
      }

      toast({
        title: "OTP Sent",
        description: "Please check your Aadhaar-linked mobile number for OTP",
      });

      setTimeLeft(600); // 10 minutes
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/verify/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaarNumber, otp }),
      });

      if (!response.ok) {
        throw new Error("Invalid OTP");
      }

      toast({
        title: "Success",
        description: "OTP verified successfully",
      });

      onVerified();
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enter OTP</Label>
        <Input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
        />
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={generateOtp}
          disabled={loading || timeLeft > 0}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : timeLeft > 0 ? (
            `Resend OTP in ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
          ) : (
            "Generate OTP"
          )}
        </Button>

        <Button onClick={verifyOtp} disabled={loading || otp.length !== 6}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Verify OTP"
          )}
        </Button>
      </div>
    </div>
  );
}