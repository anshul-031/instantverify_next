import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/auth-options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const verification = await prisma.verificationRequest.create({
      data: {
        requesterId: session.user.id,
        type: "full_verification",
        status: "pending",
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        link: crypto.randomUUID(),
      },
    });

    return NextResponse.json({
      message: "Verification submitted successfully",
      verificationId: verification.id,
    });
  } catch (error) {
    console.error("Verification submission error:", error);
    return NextResponse.json(
      { message: "Failed to submit verification" },
      { status: 500 }
    );
  }
}