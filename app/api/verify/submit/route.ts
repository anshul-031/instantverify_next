import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/auth-options";
import { initializeVerificationSteps } from "@/lib/verification-steps";
import { processVerification } from "@/lib/verification-processor";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { type, documents, biometrics } = data;

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, email: true },
    });

    if (!user || user.credits < 1) {
      return NextResponse.json(
        { message: "Insufficient credits" },
        { status: 400 }
      );
    }

    // Create verification request
    const request = await prisma.verificationRequest.create({
      data: {
        requesterId: session.user.id,
        type,
        status: "pending",
        link: crypto.randomUUID(),
        email: user.email, // Add the required email field
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    // Initialize verification steps
    await initializeVerificationSteps(request.id, type);

    // Start verification process in background
    processVerification(request.id, {
      documents,
      biometrics,
      type,
    }).catch((error) => {
      console.error("Verification processing error:", error);
    });

    // Deduct credit
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json({
      message: "Verification submitted successfully",
      verificationId: request.id,
    });
  } catch (error) {
    console.error("Verification submission error:", error);
    return NextResponse.json(
      { message: "Failed to submit verification" },
      { status: 500 }
    );
  }
}