"use client";

import { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon } from "lucide-react";

interface CameraProps {
  onCapture: (photo: string) => void;
}

export function Camera({ onCapture }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <div className="relative">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: "user"
        }}
        className="h-full w-full object-cover"
      />
      <Button
        id="capture-button"
        onClick={capture}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        size="lg"
      >
        <CameraIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}