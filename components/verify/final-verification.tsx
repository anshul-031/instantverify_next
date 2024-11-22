"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";

interface FinalVerificationProps {
  data: {
    documents: any;
    biometrics: any;
    address: any;
  };
}

export function FinalVerification({ data }: FinalVerificationProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/verify/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit verification");
      }

      const result = await response.json();
      router.push(`/verify/status/${result.verificationId}`);
    } catch (error) {
      setError("Failed to submit verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Final Verification</h2>
        <p className="mt-2 text-muted-foreground">
          Review your information and submit for verification
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Documents</h3>
          <div className="mt-2 space-y-2">
            {Object.entries(data.documents).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="capitalize">{key.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Biometrics</h3>
          <div className="mt-2 space-y-2">
            {Object.entries(data.biometrics).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="capitalize">{key.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Address</h3>
          <div className="mt-2 space-y-2">
            {Object.entries(data.address).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="capitalize">
                  {key.replace("_", " ")}: {value as string}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Verification"
          )}
        </Button>
      </div>
    </div>
  );
}