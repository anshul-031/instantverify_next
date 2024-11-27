"use client";

import { useState, useRef } from "react";
import { DocumentPreview } from "./preview";
import { DocumentInstructions } from "./instructions";
import { DocumentCamera } from "./camera";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUploadProps, DocumentUploadData } from "@/types/document-upload";

export function DocumentUpload({
  onUpload,
  acceptedTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxSize = 5 * 1024 * 1024, // 5MB default
  required = false
}: DocumentUploadProps) {
  const [documentImage, setDocumentImage] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload one of the following: ${acceptedTypes.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please upload a file smaller than ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setDocumentImage(result);
      const uploadData: DocumentUploadData = {
        documentImage: result,
        documentType: file.type
      };
      onUpload(uploadData);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (photo: string) => {
    setDocumentImage(photo);
    const uploadData: DocumentUploadData = {
      documentImage: photo,
      documentType: "image/jpeg"
    };
    onUpload(uploadData);
    setShowCamera(false);
  };

  return (
    <div className="space-y-4">
      <DocumentInstructions acceptedTypes={acceptedTypes} maxSize={maxSize} />

      {documentImage ? (
        <DocumentPreview
          image={documentImage}
          onRemove={() => {
            setDocumentImage("");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <input
              type="file"
              accept={acceptedTypes.join(",")}
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="document-upload"
              required={required && !documentImage}
            />
            <label htmlFor="document-upload">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </span>
              </Button>
            </label>
          </div>

          <Dialog open={showCamera} onOpenChange={setShowCamera}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DocumentCamera onCapture={handleCameraCapture} />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}