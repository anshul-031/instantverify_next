import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sign } from 'jsonwebtoken';
import { sendEmail } from '@/lib/email';
import { getDomainUrl } from '@/lib/utils';

const signupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(8),
  dateOfBirth: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password, dateOfBirth } =
      signupSchema.parse(body);

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (exists) {
      return NextResponse.json(
        { message: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
      },
    });

    try {
      const verificationToken = sign(
        { userId: user.id },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: "24h" }
      );

      const baseUrl = getDomainUrl(req);
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

      await sendEmail({
        to: email,
        subject: 'Verify your email address',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #1a56db; text-align: center;">InstantVerify.in</h1>
            <p>Hello ${firstName},</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email Address</a>
            </div>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>The InstantVerify.in Team</p>
          </div>
        `,
      });

      return NextResponse.json({
        message: 'Verification email sent',
        userId: user.id,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json({
        message:
          'Account created but verification email failed to send. Please use the resend verification option.',
        userId: user.id,
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}