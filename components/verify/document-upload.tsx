import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Image as ImageIcon } from "lucide-react";
import { Camera as CameraComponent } from "./camera";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onUpload: (data: { 
    documentImage: string; 
    documentNumber?: string;
    documentType: string;
  }) => void;
  acceptedTypes: string[];  // New prop for accepted file types
  maxSize: number;          // New prop for max file size
  required: boolean;        // New prop to mark the field as required
}

const documentTypes = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID" },
];

export function DocumentUpload({ onUpload, acceptedTypes, maxSize, required }: DocumentUploadProps) {
  const [documentImage, setDocumentImage] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentType, setDocumentType] = useState("aadhaar");
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size first
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `Please upload a file smaller than ${maxSize / 1024 / 1024}MB.`,
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `Please upload a valid file type. Accepted types: ${acceptedTypes.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // If file passes validation, read it and upload
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setDocumentImage(result);
        onUpload({ 
          documentImage: result, 
          documentNumber,
          documentType,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photo: string) => {
    setDocumentImage(photo);
    onUpload({ 
      documentImage: photo, 
      documentNumber,
      documentType 
    });
    setShowCamera(false);
  };

  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
    if (documentImage) {
      onUpload({
        documentImage,
        documentNumber,
        documentType: value
      });
    }
  };

  const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDocumentNumber(value);
    if (documentImage) {
      onUpload({
        documentImage,
        documentNumber: value,
        documentType
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select value={documentType} onValueChange={handleDocumentTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Document Number"
          value={documentNumber}
          onChange={handleDocumentNumberChange}
        />
      </div>

      {documentImage ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <img
            src={documentImage}
            alt="Document preview"
            className="h-full w-full object-cover"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-2 right-2"
            onClick={() => {
              setDocumentImage("");
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              type="file"
              accept={acceptedTypes.join(",")}  // Use accepted types here
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="document-upload"
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
              <CameraComponent onCapture={handleCameraCapture} />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
