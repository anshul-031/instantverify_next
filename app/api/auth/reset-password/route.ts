import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    const token = sign(
      { id: user.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}