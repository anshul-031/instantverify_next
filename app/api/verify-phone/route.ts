import { NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP via SMS
    await client.messages.create({
      body: `Your InstantVerify.in verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    // Store OTP in database or cache for verification
    // TODO: Implement OTP storage and verification

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { message: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}