import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client only if credentials are available
const client = process.env.TWILIO_ACCOUNT_SID && 
               process.env.TWILIO_AUTH_TOKEN && 
               process.env.TWILIO_PHONE_NUMBER
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(req: Request) {
  try {
    // Check if Twilio is properly configured
    if (!client || !process.env.TWILIO_PHONE_NUMBER) {
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

    // Send OTP via SMS
    await client.messages.create({
      body: `Your InstantVerify.in verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    // Store OTP in database or cache for verification
    // TODO: Implement OTP storage and verification

    return NextResponse.json({ 
      message: 'OTP sent successfully',
      success: true
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