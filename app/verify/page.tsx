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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera } from "@/components/verify/camera";
import { DocumentUpload } from "@/components/verify/document-upload";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const verificationSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  country: z.string().default("IN"),
  verificationType: z.string().min(1, "Verification type is required"),
  aadhaarNumber: z.string().optional(),
  documentNumber: z.string().min(1, "Document number is required"),
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

const ORIGINAL_PRICE = 100;
const DISCOUNT_PERCENTAGE = 80;

export default function VerifyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("advanced");
  const [personPhoto, setPersonPhoto] = useState<string | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerificationForm>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      country: "IN",
    },
  });

  const verificationType = watch("verificationType");
  const needsAadhaar = verificationType?.includes("aadhaar");

  const calculatePrice = () => {
    const discountedPrice = ORIGINAL_PRICE * (1 - DISCOUNT_PERCENTAGE / 100);
    const gst = discountedPrice * 0.18;
    return {
      original: ORIGINAL_PRICE,
      discounted: discountedPrice.toFixed(2),
      final: (discountedPrice + gst).toFixed(2),
    };
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== "advanced") {
      toast({
        title: "Recommendation",
        description: "Advanced verification provides the most comprehensive and reliable results. We recommend using advanced verification for better accuracy.",
        variant: "warning",
      });
    }
  };

  const onSubmit = async (data: VerificationForm) => {
    try {
      if (!personPhoto || !documentImage) {
        toast({
          title: "Error",
          description: "Please provide both person photo and document image",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          personPhoto,
          documentImage,
        }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Verification submitted successfully",
      });

      router.push(`/report/${result.verificationId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit verification request",
        variant: "destructive",
      });
    }
  };

  const handleDocumentUpload = (data: { documentImage: string; documentNumber?: string }) => {
    setDocumentImage(data.documentImage);
    if (data.documentNumber) {
      setValue("documentNumber", data.documentNumber);
    }
  };

  const prices = calculatePrice();

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Start Verification</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
                <TabsTrigger value="basic">Basic</TabsTrigger>
              </TabsList>

              {activeTab !== "advanced" && (
                <Alert className="mt-4" variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Advanced verification provides the most comprehensive and reliable results. 
                    We recommend using advanced verification for better accuracy.
                  </AlertDescription>
                </Alert>
              )}

              {Object.entries(verificationTypes).map(([level, types]) => (
                <TabsContent key={level} value={level}>
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
                          {types.map((type) => (
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
                        />
                        {errors.aadhaarNumber && (
                          <p className="text-sm text-red-500">
                            {errors.aadhaarNumber.message}
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            // Handle OTP request
                          }}
                        >
                          Request OTP
                        </Button>
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
                </TabsContent>
              ))}
            </Tabs>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Person Photo</Label>
                <Camera onCapture={setPersonPhoto} />
              </div>

              <div className="space-y-2">
                <Label>Government ID</Label>
                <DocumentUpload onUpload={handleDocumentUpload} />
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Submit Verification"}
          </Button>
        </form>
      </div>
    </div>
  );
}