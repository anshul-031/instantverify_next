"use client";

import { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon } from "lucide-react";

interface DocumentCameraProps {
  onCapture: (photo: string) => void;
}

export function DocumentCamera({ onCapture }: DocumentCameraProps) {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "environment"
          }}
          className="h-full w-full object-cover"
        />
      </div>
      <Button onClick={capture} className="w-full">
        <CameraIcon className="mr-2 h-4 w-4" />
        Capture Document
      </Button>
    </div>
  );
}