import { prisma } from "./prisma";
import { generatePDF } from "./pdf-generator";

export async function generateReport(requestId: string): Promise<void> {
  try {
    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: {
        steps: true,
      },
    });

    if (!request) {
      throw new Error("Verification request not found");
    }

    // Compile report data
    const reportData = {
      id: request.id,
      status: request.status,
      steps: request.steps.map(step => ({
        name: step.name,
        status: step.status,
        description: step.description,
        timestamp: step.createdAt,
      })),
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };

    // Create report record
    const report = await prisma.report.create({
      data: {
        userId: request.requesterId,
        verificationId: request.id,
        purpose: "verification",
        documentType: request.type,
        documentNumber: "", // Will be updated with actual document number
        personPhoto: "", // Will be updated with actual photo URL
        documentImage: "", // Will be updated with actual document URL
        status: request.status,
        result: reportData,
      },
    });

    // Generate PDF report
    await generatePDF(report.id);

  } catch (error) {
    console.error("Report generation error:", error);
    throw error;
  }
}