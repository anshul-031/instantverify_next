import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, a verification email has been sent" },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 }
      );
    }

    try {
      const verificationToken = sign(
        { userId: user.id },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: '24h' }
      );

      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

      await sendEmail({
        to: email,
        subject: "Verify your email address",
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #1a56db; text-align: center;">InstantVerify.in</h1>
            <p>Hello ${user.firstName},</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email Address</a>
            </div>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this email, you can safely ignore it.</p>
            <p>Best regards,<br>The InstantVerify.in Team</p>
          </div>
        `,
      });

      return NextResponse.json({
        message: "Verification email sent",
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}