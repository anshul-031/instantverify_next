import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/auth-options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { feedback, email, phone } = await req.json();

    if (!feedback) {
      return NextResponse.json(
        { message: "Feedback is required" },
        { status: 400 }
      );
    }

    // Store feedback with user info if available
    const feedbackData = await prisma.feedback.create({
      data: {
        content: feedback,
        userId: session?.user?.id || null,
      },
    });

    // If user is not logged in, store contact info separately
    if (!session?.user?.id && (email || phone)) {
      await prisma.contactRequest.create({
        data: {
          name: "Anonymous Feedback",
          email: email || "",
          phone: phone || "",
          message: feedback,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({
      message: "Feedback submitted successfully",
      feedbackId: feedbackData.id,
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { message: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}