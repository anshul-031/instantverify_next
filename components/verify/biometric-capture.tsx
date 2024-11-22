"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "@/components/verify/camera";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Camera as CameraIcon } from "lucide-react";

interface BiometricCaptureProps {
  onComplete: (data: any) => void;
}

export function BiometricCapture({ onComplete }: BiometricCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (photoData: string) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate biometric processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPhoto(photoData);
    } catch (error) {
      setError("Failed to process biometric data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!photo) {
      setError("Please capture your photo before proceeding.");
      return;
    }

    onComplete({ photo });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Biometric Capture</h2>
        <p className="mt-2 text-muted-foreground">
          Please capture a clear photo of your face
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {!photo ? (
          <Camera onCapture={handleCapture} />
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            <img
              src={photo}
              alt="Captured"
              className="h-full w-full object-cover"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={() => setPhoto(null)}
            >
              Retake
            </Button>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={loading || !photo}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CameraIcon className="mr-2 h-4 w-4" />
              Continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}