"use client";

import { useState, useCallback } from "react";
import { Camera } from "./camera";
import { PhotoPreview } from "./preview";
import { PhotoInstructions } from "./instructions";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, Repeat } from "lucide-react";

interface PhotoCaptureProps {
  onCapture: (photoData: {
    image: string;
    timestamp: string;
    location?: { latitude: number; longitude: number };
  }) => void;
}

export function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const { location } = useGeolocation();

  const handleCapture = useCallback((imageSrc: string) => {
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
  }, [location, onCapture]);

  const handleRetake = () => {
    setPhoto(null);
  };

  return (
    <div className="space-y-4">
      <PhotoInstructions />
      
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {!photo ? (
          <Camera onCapture={handleCapture} />
        ) : (
          <PhotoPreview photo={photo} />
        )}
      </div>

      <div className="flex justify-center">
        {!photo ? (
          <Button onClick={() => document.getElementById("capture-button")?.click()}>
            <CameraIcon className="mr-2 h-4 w-4" />
            Capture Photo
          </Button>
        ) : (
          <Button onClick={handleRetake} variant="outline">
            <Repeat className="mr-2 h-4 w-4" />
            Retake Photo
          </Button>
        )}
      </div>
    </div>
  );
}