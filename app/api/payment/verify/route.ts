import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { authOptions } from '../../auth/auth-options';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update transaction status
    const transaction = await prisma.transaction.findFirst({
      where: { paymentId: razorpay_order_id },
    });

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction and add credits to user
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'completed' },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: { credits: { increment: transaction.credits } },
      }),
    ]);

    return NextResponse.json({
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}