"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentUpload } from "./document-upload";
import { useToast } from "@/hooks/use-toast";
import { FileCheck, Loader2 } from "lucide-react";

interface DocumentVerificationProps {
  onComplete: (data: {
    documentType: string;
    documentNumber: string;
    documentImage: string;
  }) => void;
}

export function DocumentVerification({ onComplete }: DocumentVerificationProps) {
  const [documentImage, setDocumentImage] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDocumentUpload = (data: { documentImage: string; documentNumber?: string }) => {
    setDocumentImage(data.documentImage);
    if (data.documentNumber) {
      setDocumentNumber(data.documentNumber);
    }
  };

  const handleVerify = async () => {
    if (!documentImage || !documentNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide both document image and number",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate document verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onComplete({
        documentType: "aadhaar",
        documentNumber,
        documentImage,
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Failed to verify document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Document Verification</h2>
          <p className="mt-2 text-muted-foreground">
            Upload your Aadhaar card for verification
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentNumber">Aadhaar Number</Label>
            <Input
              id="documentNumber"
              placeholder="12-digit Aadhaar number"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              maxLength={12}
              pattern="\d*"
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Aadhaar Card</Label>
            <DocumentUpload onUpload={handleDocumentUpload} />
          </div>

          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={loading || !documentImage || !documentNumber}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-4 w-4" />
                Verify Document
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}