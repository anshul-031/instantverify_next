import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      );
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { emailVerified: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Invalid or expired verification token" },
      { status: 400 }
    );
  }
}