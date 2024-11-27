"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, Repeat } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";

interface PhotoCaptureProps {
  onCapture: (photoData: {
    image: string;
    timestamp: string;
    location?: { latitude: number; longitude: number };
  }) => void;
}

export function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const { location } = useGeolocation();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const photoData = {
        image: imageSrc,
        timestamp: new Date().toISOString(),
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : undefined
      };
      setPhoto(imageSrc);
      onCapture(photoData);
    }
  }, [location, onCapture]);

  const retake = () => {
    setPhoto(null);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {!photo ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              aspectRatio: 16 / 9,
              facingMode: "user"
            }}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={photo}
            alt="Captured"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex justify-center">
        {!photo ? (
          <Button onClick={capture}>
            <Camera className="mr-2 h-4 w-4" />
            Capture Photo
          </Button>
        ) : (
          <Button onClick={retake} variant="outline">
            <Repeat className="mr-2 h-4 w-4" />
            Retake Photo
          </Button>
        )}
      </div>
    </div>
  );
}