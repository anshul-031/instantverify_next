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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { SUPPORTED_COUNTRIES } from "@/lib/countries";
import { VerificationTabs } from "@/components/verify/verification-tabs";
import { DocumentForm } from "@/components/verify/document-form";
import { PaymentModal } from "@/components/verify/payment-modal";
import { useCredits } from "@/hooks/use-credits";

const verificationSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  country: z.string().min(1, "Country is required"),
  verificationType: z.string().min(1, "Verification type is required"),
  documentType: z.string().min(1, "Document type is required"),
  documentNumber: z.string().min(1, "Document number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  documentImageFront: z.string().min(1, "Front side of document is required"),
  documentImageBack: z.string().min(1, "Back side of document is required"),
  personPhoto: z.string().min(1, "Person photo is required"),
  photoMetadata: z.object({
    timestamp: z.string(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number()
    }).optional()
  })
});

type VerificationForm = z.infer<typeof verificationSchema>;

const verificationPurposes = [
  { value: "tenant", label: "Tenant Verification" },
  { value: "maid", label: "Maid Verification" },
  { value: "driver", label: "Driver Verification" },
  { value: "matrimonial", label: "Matrimonial Verification" },
  { value: "other", label: "Other" }
];

export default function VerifyPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [verificationId, setVerificationId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { credits } = useCredits();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VerificationForm>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      country: "IN"
    }
  });

  const handleVerificationSubmit = async (data: VerificationForm) => {
    try {
      setLoading(true);

      if (credits < 1) {
        // Show payment modal if insufficient credits
        const response = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Verification submission failed");
        }

        const result = await response.json();
        setVerificationId(result.verificationId);
        setShowPayment(true);
        return;
      }

      // If user has sufficient credits, proceed with verification
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, useCredits: "completed" }),
      });

      if (!response.ok) {
        throw new Error("Verification submission failed");
      }

      const result = await response.json();
      router.push(`/verify/status/${result.verificationId}`);
    } catch (error) {
      console.log("error : ",error);
      if (credits < 1) {
        setShowPayment(true);
      }
      toast({
        title: "Error",
        description: "Failed to submit verification request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (verificationId) {
      router.push(`/verify/status/${verificationId}`);
    }
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Start Verification</h1>

        <form onSubmit={handleSubmit(handleVerificationSubmit)} className="space-y-8">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Verification</Label>
                <Select
                  onValueChange={value => setValue("purpose", value)}
                  defaultValue={watch("purpose")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select verification purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {verificationPurposes.map(purpose => (
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
                  onValueChange={value => setValue("country", value)}
                  defaultValue={watch("country")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_COUNTRIES.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {watch("country") !== "IN" && (
                  <Alert>
                    <AlertDescription>
                      Currently, only Indian IDs are supported. Support for other countries will be added soon.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <VerificationTabs onVerificationTypeChange={type => setValue("verificationType", type)} />

              {watch("verificationType") && (
                <DocumentForm
                  verificationType={watch("verificationType")}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  watch={watch}
                />
              )}
            </div>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Submit Verification"}
          </Button>
        </form>

        <PaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
          amount={100}
          verificationId={verificationId}
        />
      </div>
    </div>
  );
}