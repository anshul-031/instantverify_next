"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Steps } from "@/components/verify/steps";
import { DocumentUpload } from "@/components/verify/document-upload";
import { BiometricCapture } from "@/components/verify/biometric-capture";
import { AddressVerification } from "@/components/verify/address-verification";
import { FinalVerification } from "@/components/verify/final-verification";

export default function VerificationProcessPage() {
  const { session } = useAuth({ required: true });
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    documents: {},
    biometrics: {},
    address: {},
  });

  const steps = [
    {
      title: "Document Upload",
      description: "Upload required identification documents",
      component: (
        <DocumentUpload
          onUpload={(documents) => {
            setData((prev) => ({ ...prev, documents }));
            setStep(1);
          }}
          acceptedTypes={["image/jpeg", "image/png", "application/pdf"]} // specify accepted types
          maxSize={5 * 1024 * 1024} // 5MB
          required={true} // mark as required
        />
      ),
    },
    {
      title: "Biometric Capture",
      description: "Capture photo and fingerprint",
      component: (
        <BiometricCapture
          onComplete={(biometrics) => {
            setData((prev) => ({ ...prev, biometrics }));
            setStep(2);
          }}
        />
      ),
    },
    {
      title: "Address Verification",
      description: "Verify current address",
      component: (
        <AddressVerification
          onComplete={(address) => {
            setData((prev) => ({ ...prev, address }));
            setStep(3);
          }}
        />
      ),
    },
    {
      title: "Final Verification",
      description: "Review and submit",
      component: <FinalVerification data={data} />,
    },
  ];

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <Steps steps={steps} currentStep={step} />
        <Card className="mt-8 p-6">
          {steps[step].component}
        </Card>
      </div>
    </div>
  );
}
