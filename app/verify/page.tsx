"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera } from "@/components/verify/camera";
import { DocumentUpload } from "@/components/verify/document-upload";
import { PaymentModal } from "@/components/verify/payment-modal";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { AlertTriangle, IndianRupee } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useAuth } from "@/hooks/use-auth";

const verificationSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  country: z.string().default("IN"),
  verificationType: z.string().min(1, "Verification type is required"),
  aadhaarNumber: z.string()
    .optional()
    .refine((val) => !val || /^\d{12}$/.test(val), {
      message: "Aadhaar number must be 12 digits",
    }),
  documentNumber: z.string()
    .min(1, "Document number is required")
    .refine((val) => {
      if (!val) return false;
      // Validate based on document type
      if (val.startsWith("DL")) {
        return /^[A-Z]{2}\d{13}$/.test(val); // DL format
      }
      return /^[A-Z0-9]{8,}$/.test(val); // Generic format
    }, {
      message: "Invalid document number format",
    }),
  personPhoto: z.string().min(1, "Person photo is required"),
  documentImage: z.string().min(1, "Document image is required"),
  documentType: z.string().min(1, "Document type is required"),
});

type VerificationForm = z.infer<typeof verificationSchema>;

const purposes = [
  { value: "tenant", label: "Tenant Verification" },
  { value: "domestic", label: "Domestic Help Verification" },
  { value: "driver", label: "Driver Verification" },
  { value: "matrimonial", label: "Matrimonial Verification" },
  { value: "other", label: "Other" },
];

const verificationTypes = {
  advanced: [
    { value: "aadhaar_otp", label: "Aadhaar ID + OTP" },
    { value: "dl_aadhaar_otp", label: "Driving License + Aadhaar + OTP" },
    { value: "voter_aadhaar_otp", label: "Voter ID + Aadhaar + OTP" },
  ],
  medium: [
    { value: "driving_license", label: "Driving License" },
  ],
  basic: [
    { value: "voter_id", label: "Voter ID" },
  ],
};

const VERIFICATION_PRICE = 100;
const DISCOUNT_PERCENTAGE = 80;

export default function VerifyPage() {
  const { session } = useAuth({ required: true });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("advanced");
  const [personPhoto, setPersonPhoto] = useState<string | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const { toast } = useToast();
  const { credits } = useCredits();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<VerificationForm>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      country: "IN",
    },
  });

  const verificationType = watch("verificationType");
  const needsAadhaar = verificationType?.includes("aadhaar");

  const calculatePrice = () => {
    const discountedPrice = VERIFICATION_PRICE * (1 - DISCOUNT_PERCENTAGE / 100);
    const gst = discountedPrice * 0.18;
    return {
      original: VERIFICATION_PRICE,
      discounted: discountedPrice.toFixed(2),
      final: (discountedPrice + gst).toFixed(2),
    };
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setValue("verificationType", ""); // Reset verification type when changing tabs
    if (value !== "advanced") {
      toast({
        title: "Recommendation",
        description: "Advanced verification provides the most comprehensive and reliable results. We recommend using advanced verification for better accuracy.",
        variant: "destructive",
      });
    }
  };

  const handleVerificationSubmit = async (data: VerificationForm) => {
    if (!personPhoto || !documentImage || !documentType) {
      toast({
        title: "Error",
        description: "Please provide both person photo and document image",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          personPhoto,
          documentImage,
          documentType,
        }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const result = await response.json();
      setVerificationId(result.verificationId);

      if (credits < 1) {
        setShowPayment(true);
      } else {
        router.push(`/report/${result.verificationId}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit verification request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (data: { 
    documentImage: string; 
    documentNumber?: string;
    documentType: string;
  }) => {
    setDocumentImage(data.documentImage);
    setDocumentType(data.documentType);
    if (data.documentNumber) {
      setValue("documentNumber", data.documentNumber);
      await trigger("documentNumber");
    }
    setValue("documentType", data.documentType);
    setValue("documentImage", data.documentImage);
  };

  const handlePersonPhotoCapture = async (photo: string) => {
    setPersonPhoto(photo);
    setValue("personPhoto", photo);
    await trigger("personPhoto");
  };

  const prices = calculatePrice();

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Start Verification</h1>

        <form onSubmit={handleSubmit(handleVerificationSubmit)} className="space-y-8">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Verification</Label>
                <Select onValueChange={(value) => setValue("purpose", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposes.map((purpose) => (
                      <SelectItem key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.purpose && (
                  <p className="text-sm text-red-500">{errors.purpose.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select 
                  defaultValue="IN"
                  onValueChange={(value) => setValue("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationType">Verification Type</Label>
                <Select
                  onValueChange={(value) => setValue("verificationType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select verification type" />
                  </SelectTrigger>
                  <SelectContent>
                    {verificationTypes[activeTab as keyof typeof verificationTypes].map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.verificationType && (
                  <p className="text-sm text-red-500">
                    {errors.verificationType.message}
                  </p>
                )}
              </div>

              {needsAadhaar && (
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    {...register("aadhaarNumber")}
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength={12}
                  />
                  {errors.aadhaarNumber && (
                    <p className="text-sm text-red-500">
                      {errors.aadhaarNumber.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Document Number</Label>
                <Input
                  id="documentNumber"
                  {...register("documentNumber")}
                  placeholder="Enter document number"
                />
                {errors.documentNumber && (
                  <p className="text-sm text-red-500">
                    {errors.documentNumber.message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Person Photo</Label>
                <Camera onCapture={handlePersonPhotoCapture} />
                {errors.personPhoto && (
                  <p className="text-sm text-red-500">{errors.personPhoto.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Government ID</Label>
                <DocumentUpload onUpload={handleDocumentUpload} />
                {errors.documentImage && (
                  <p className="text-sm text-red-500">{errors.documentImage.message}</p>
                )}
                {errors.documentType && (
                  <p className="text-sm text-red-500">{errors.documentType.message}</p>
                )}
              </div>
            </div>
          </Card>

          <div className="rounded-lg border bg-card p-4 text-card-foreground">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground line-through">
                Original price: ₹{prices.original}
              </p>
              <p className="text-sm font-medium">
                Special offer: ₹{prices.discounted} + GST
              </p>
              <p className="text-sm text-muted-foreground">
                Final price: ₹{prices.final} (incl. GST)
              </p>
              <p className="text-xs text-muted-foreground">
                * Special {DISCOUNT_PERCENTAGE}% discount available for a limited time
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Submit Verification"}
          </Button>
        </form>

        <PaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            if (verificationId) {
              router.push(`/report/${verificationId}`);
            }
          }}
          amount={Number(prices.final)}
          verificationId={verificationId || undefined}
        />
      </div>
    </div>
  );
}