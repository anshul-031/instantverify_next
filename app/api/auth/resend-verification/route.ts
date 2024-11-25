import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken";
import { sendEmail } from "@/lib/email";
import { getDomainUrl } from "@/lib/utils";

const COOLDOWN_MINUTES = 5;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        firstName: true, 
        emailVerified: true,
        lastVerificationEmailSent: true 
      },
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

    // Check cooldown
    if (user.lastVerificationEmailSent) {
      const timeSinceLastEmail = Date.now() - user.lastVerificationEmailSent.getTime();
      const minutesSinceLastEmail = Math.floor(timeSinceLastEmail / 1000 / 60);

      if (minutesSinceLastEmail < COOLDOWN_MINUTES) {
        return NextResponse.json(
          { 
            message: `Please wait ${COOLDOWN_MINUTES - minutesSinceLastEmail} minutes before requesting another verification email`,
            remainingTime: COOLDOWN_MINUTES - minutesSinceLastEmail
          },
          { status: 429 }
        );
      }
    }

    const verificationToken = sign(
      { userId: user.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "24h" }
    );

    const baseUrl = getDomainUrl(req);
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

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

    // Update last verification email sent timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastVerificationEmailSent: new Date() },
    });

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Failed to send verification email" },
      { status: 500 }
    );
  }
}