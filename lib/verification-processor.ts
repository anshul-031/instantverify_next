import { updateVerificationStep } from "./verification-steps";
import { verifyAadhaar } from "./providers/aadhaar";
import { verifyDrivingLicense } from "./providers/driving-license";
import { checkCriminalRecords } from "./providers/criminal-records";
import { matchFaces } from "./providers/face-match";
import { generateReport } from "./report-generator";

interface VerificationData {
  documents: any;
  biometrics: any;
  type: string;
}

export async function processVerification(
  requestId: string,
  data: VerificationData
): Promise<void> {
  try {
    // Document Upload Step
    await updateVerificationStep(requestId, "Document Upload", "processing");
    // Validate documents
    if (!validateDocuments(data.documents)) {
      await updateVerificationStep(
        requestId,
        "Document Upload",
        "failed",
        "Invalid or missing documents"
      );
      return;
    }
    await updateVerificationStep(requestId, "Document Upload", "completed");

    // OTP Verification Step
    await updateVerificationStep(requestId, "OTP Verification", "processing");
    const otpResult = await verifyAadhaar(data.documents.aadhaarNumber);
    if (!otpResult.success) {
      await updateVerificationStep(
        requestId,
        "OTP Verification",
        "failed",
        otpResult.message
      );
      return;
    }
    await updateVerificationStep(requestId, "OTP Verification", "completed");

    // Document Verification Steps
    if (data.type === "DL_AADHAAR_OTP") {
      await updateVerificationStep(
        requestId,
        "License Verification",
        "processing"
      );
      const dlResult = await verifyDrivingLicense(
        data.documents.drivingLicenseNumber
      );
      if (!dlResult.success) {
        await updateVerificationStep(
          requestId,
          "License Verification",
          "failed",
          dlResult.message
        );
        return;
      }
      await updateVerificationStep(
        requestId,
        "License Verification",
        "completed"
      );
    }

    // Face Match Step
    await updateVerificationStep(requestId, "Face Match", "processing");
    const faceMatchResult = await matchFaces(
      data.biometrics.photo,
      data.documents.photo
    );
    if (!faceMatchResult.success) {
      await updateVerificationStep(
        requestId,
        "Face Match",
        "failed",
        faceMatchResult.message
      );
      return;
    }
    await updateVerificationStep(requestId, "Face Match", "completed");

    // Criminal Records Check
    await updateVerificationStep(requestId, "Criminal Records", "processing");
    const criminalRecords = await checkCriminalRecords({
      name: data.documents.name,
      dateOfBirth: data.documents.dateOfBirth,
      fatherName: data.documents.fatherName,
    });
    await updateVerificationStep(requestId, "Criminal Records", "completed", {
      records: criminalRecords,
    });

    // Generate Report
    await updateVerificationStep(requestId, "Report Generation", "processing");
    await generateReport(requestId);
    await updateVerificationStep(requestId, "Report Generation", "completed");
  } catch (error) {
    console.error("Verification processing error:", error);
    // Update current step as failed
    const steps = await prisma.verificationStep.findMany({
      where: { requestId, status: "processing" },
    });
    if (steps.length > 0) {
      await updateVerificationStep(
        requestId,
        steps[0].name,
        "failed",
        "Internal processing error"
      );
    }
  }
}

function validateDocuments(documents: any): boolean {
  // Implement document validation logic
  return true;
}