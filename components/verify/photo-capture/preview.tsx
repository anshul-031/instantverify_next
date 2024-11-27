"use client";

interface PhotoPreviewProps {
  photo: string;
}

export function PhotoPreview({ photo }: PhotoPreviewProps) {
  return (
    <div className="relative h-full w-full">
      <img
        src={photo}
        alt="Captured"
        className="h-full w-full object-cover"
      />
    </div>
  );
}