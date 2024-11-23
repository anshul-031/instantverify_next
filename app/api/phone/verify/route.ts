import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Twilio } from 'twilio';
import { authOptions } from '../../auth/auth-options';

// Initialize Twilio client only if credentials are available
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      return NextResponse.json(
        { message: 'SMS service not configured' },
        { status: 503 }
      );
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database with expiry
    await prisma.phoneVerification.create({
      data: {
        userId: session.user.id,
        phone,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send OTP via SMS
    await twilioClient.messages.create({
      body: `Your InstantVerify.in verification code is: ${otp}`,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return NextResponse.json({
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Phone verification error:', error);

    // Handle specific Twilio errors
    if ((error as any).code) {
      const twilioError = error as { code: number; message: string };
      return NextResponse.json(
        { message: `SMS service error: ${twilioError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}