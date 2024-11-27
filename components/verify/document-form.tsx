"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentUpload } from "./document-upload";
import { PhotoCapture } from "./photo-capture";
import { VERIFICATION_TYPES } from "@/lib/verification-types";
import { DocumentUploadData } from "@/types/document-upload";

interface DocumentFormProps {
  verificationType: string;
  register: any;
  setValue: any;
  errors: any;
  watch: any;
}

export function DocumentForm({
  verificationType,
  register,
  setValue,
  errors,
  watch
}: DocumentFormProps) {
  const verificationConfig = Object.values(VERIFICATION_TYPES)
    .flat()
    .find(type => type.value === verificationType);

  useEffect(() => {
    if (verificationConfig) {
      setValue("documentType", verificationConfig.documentType);
    }
  }, [verificationConfig, setValue]);

  if (!verificationConfig) return null;

  const handleDocumentUpload = (field: string) => (data: DocumentUploadData) => {
    setValue(field, data.documentImage);
  };

  return (
    <div className="space-y-6">
      {verificationConfig.requiresOtp && (
        <div className="space-y-2">
          <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
          <Input
            id="aadhaarNumber"
            {...register("aadhaarNumber")}
            placeholder="Enter 12-digit Aadhaar number"
            maxLength={12}
          />
          {errors.aadhaarNumber && (
            <p className="text-sm text-red-500">{errors.aadhaarNumber.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="documentNumber">
          {verificationConfig.documentType.replace('_', ' ').toUpperCase()} Number
        </Label>
        <Input
          id="documentNumber"
          {...register("documentNumber")}
          placeholder={`Enter ${verificationConfig.documentType.replace('_', ' ')} number`}
        />
        {errors.documentNumber && (
          <p className="text-sm text-red-500">{errors.documentNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          {...register("dateOfBirth")}
        />
        {errors.dateOfBirth && (
          <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Document Photo (Front)</Label>
        <DocumentUpload
          onUpload={handleDocumentUpload("documentImageFront")}
          acceptedTypes={["image/jpeg", "image/png", "application/pdf"]}
          maxSize={5 * 1024 * 1024} // 5MB
          required={true}
        />
        {errors.documentImageFront && (
          <p className="text-sm text-red-500">{errors.documentImageFront.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Document Photo (Back)</Label>
        <DocumentUpload
          onUpload={handleDocumentUpload("documentImageBack")}
          acceptedTypes={["image/jpeg", "image/png", "application/pdf"]}
          maxSize={5 * 1024 * 1024} // 5MB
          required={true}
        />
        {errors.documentImageBack && (
          <p className="text-sm text-red-500">{errors.documentImageBack.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Person Photo</Label>
        <PhotoCapture
          onCapture={(data) => {
            setValue("personPhoto", data.image);
            setValue("photoMetadata", {
              timestamp: data.timestamp,
              location: data.location
            });
          }}
        />
        {errors.personPhoto && (
          <p className="text-sm text-red-500">{errors.personPhoto.message}</p>
        )}
      </div>
    </div>
  );
}
