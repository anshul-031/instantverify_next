"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, Loader2 } from "lucide-react";

interface ReportActionsProps {
  verificationId: string;
  onDownload: () => void;
  generating: boolean;
}

export function ReportActions({ verificationId, onDownload, generating }: ReportActionsProps) {
  const [canShare, setCanShare] = useState(() => {
    // Check if Web Share API is supported during component initialization
    return typeof navigator !== 'undefined' && 'share' in navigator;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      if (!canShare) return;

      await navigator.share({
        title: "Verification Report",
        text: `Verification Report ${verificationId}`,
        url: window.location.href,
      });
    } catch (error) {
      // Handle share error or user cancellation
      console.error("Share failed:", error);
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Button onClick={onDownload} disabled={generating}>
        {generating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download PDF
      </Button>

      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>

      {canShare && (
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      )}
    </div>
  );
}