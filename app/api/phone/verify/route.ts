import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import { authOptions } from '../../auth/auth-options';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await req.json();

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
    await client.messages.create({
      body: `Your InstantVerify.in verification code is: ${otp}`,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return NextResponse.json({
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { message: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}