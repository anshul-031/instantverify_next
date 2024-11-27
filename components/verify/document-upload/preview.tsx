"use client";

import { Button } from "@/components/ui/button";

interface DocumentPreviewProps {
  image: string;
  onRemove: () => void;
}

export function DocumentPreview({ image, onRemove }: DocumentPreviewProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
      <img
        src={image}
        alt="Document preview"
        className="h-full w-full object-cover"
      />
      <Button
        variant="outline"
        size="sm"
        className="absolute bottom-2 right-2"
        onClick={onRemove}
      >
        Remove
      </Button>
    </div>
  );
}