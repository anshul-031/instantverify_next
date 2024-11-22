import { useState, useRef } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, Repeat } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CameraProps {
  onCapture: (photo: string) => void;
}

export function Camera({ onCapture }: CameraProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [photo, setPhoto] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === "videoinput");
    setDevices(videoDevices);
    if (videoDevices.length > 0) {
      setSelectedDevice(videoDevices[0].deviceId);
    }
  };

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      onCapture(imageSrc);
    }
  };

  const retake = () => {
    setPhoto(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select
          value={selectedDevice}
          onValueChange={(value) => setSelectedDevice(value)}
          onOpenChange={handleDevices}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select camera" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${devices.indexOf(device) + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {!photo ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              deviceId: selectedDevice,
              aspectRatio: 16 / 9,
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
            <CameraIcon className="mr-2 h-4 w-4" />
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