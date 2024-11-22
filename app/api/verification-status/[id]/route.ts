import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/auth-options";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verification = await prisma.verificationRequest.findFirst({
      where: {
        OR: [
          { id: params.id },
          { link: params.id }
        ],
        requesterId: session.user.id,
      },
      include: {
        steps: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { message: "Verification not found" },
        { status: 404 }
      );
    }

    // Calculate overall progress based on completed steps
    const totalSteps = verification.steps.length;
    const completedSteps = verification.steps.filter(
      step => step.status === "completed"
    ).length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    const response = {
      id: verification.id,
      status: verification.status,
      progress,
      steps: verification.steps.map(step => ({
        name: step.name,
        status: step.status,
        description: step.description,
        timestamp: step.createdAt.toISOString(),
      })),
      createdAt: verification.createdAt.toISOString(),
      updatedAt: verification.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Verification status error:", error);
    return NextResponse.json(
      { message: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}