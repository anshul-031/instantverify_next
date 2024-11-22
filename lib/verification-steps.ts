import { VerificationStep } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StepStatus = "pending" | "processing" | "completed" | "failed" | "warning";

export interface VerificationStepData {
  name: string;
  description?: string;
  status: StepStatus;
}

const VERIFICATION_STEPS = {
  AADHAAR_OTP: [
    {
      name: "Document Upload",
      description: "Upload Aadhaar card and capture photo",
    },
    {
      name: "OTP Verification",
      description: "Verify OTP sent to Aadhaar-linked mobile",
    },
    {
      name: "UIDAI Verification",
      description: "Verify Aadhaar details with UIDAI",
    },
    {
      name: "Face Match",
      description: "Match captured photo with Aadhaar photo",
    },
    {
      name: "Criminal Records",
      description: "Check criminal records and court cases",
    },
    {
      name: "Report Generation",
      description: "Generate final verification report",
    },
  ],
  DL_AADHAAR_OTP: [
    {
      name: "Document Upload",
      description: "Upload Driving License and Aadhaar card",
    },
    {
      name: "OTP Verification",
      description: "Verify OTP sent to Aadhaar-linked mobile",
    },
    {
      name: "License Verification",
      description: "Verify Driving License details",
    },
    {
      name: "UIDAI Verification",
      description: "Verify Aadhaar details with UIDAI",
    },
    {
      name: "Face Match",
      description: "Match photos from both documents",
    },
    {
      name: "Criminal Records",
      description: "Check criminal records and court cases",
    },
    {
      name: "Report Generation",
      description: "Generate final verification report",
    },
  ],
};

export async function initializeVerificationSteps(
  requestId: string,
  verificationType: keyof typeof VERIFICATION_STEPS
): Promise<VerificationStep[]> {
  const steps = VERIFICATION_STEPS[verificationType];
  
  if (!steps) {
    throw new Error(`Invalid verification type: ${verificationType}`);
  }

  const createdSteps = await Promise.all(
    steps.map((step) =>
      prisma.verificationStep.create({
        data: {
          requestId,
          name: step.name,
          description: step.description,
          status: "pending",
        },
      })
    )
  );

  return createdSteps;
}

export async function updateVerificationStep(
  requestId: string,
  stepName: string,
  status: StepStatus,
  description?: string
): Promise<VerificationStep> {
  const step = await prisma.verificationStep.findFirst({
    where: {
      requestId,
      name: stepName,
    },
  });

  if (!step) {
    throw new Error(`Step not found: ${stepName}`);
  }

  const updatedStep = await prisma.verificationStep.update({
    where: { id: step.id },
    data: {
      status,
      description: description || step.description,
    },
  });

  // Update request status based on steps
  const allSteps = await prisma.verificationStep.findMany({
    where: { requestId },
  });

  const newStatus = calculateRequestStatus(allSteps);
  await prisma.verificationRequest.update({
    where: { id: requestId },
    data: { status: newStatus },
  });

  return updatedStep;
}

function calculateRequestStatus(steps: VerificationStep[]): string {
  if (steps.some((step) => step.status === "failed")) {
    return "failed";
  }
  if (steps.every((step) => step.status === "completed")) {
    return "completed";
  }
  if (steps.some((step) => step.status === "processing")) {
    return "processing";
  }
  return "pending";
}

export async function getVerificationProgress(
  requestId: string
): Promise<{
  status: string;
  progress: number;
  steps: VerificationStep[];
}> {
  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    include: {
      steps: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!request) {
    throw new Error(`Verification request not found: ${requestId}`);
  }

  const completedSteps = request.steps.filter(
    (step) => step.status === "completed"
  ).length;
  const progress = Math.round((completedSteps / request.steps.length) * 100);

  return {
    status: request.status,
    progress,
    steps: request.steps,
  };
}