import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      backendLogger.error('Unauthorized payment verification attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = await req.json();

    backendLogger.info('Verifying payment', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

    if (!process.env.RAZORPAY_KEY_SECRET) {
      backendLogger.error('Razorpay secret key not configured');
      return NextResponse.json(
        { message: 'Payment verification not configured' },
        { status: 503 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      backendLogger.error('Invalid payment signature', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      return NextResponse.json(
        { message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update transaction status
    const transaction = await prisma.transaction.findFirst({
      where: { paymentId: razorpay_order_id },
    });

    if (!transaction) {
      backendLogger.error('Transaction not found', { orderId: razorpay_order_id });
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

    backendLogger.info('Payment verified and credits added', {
      transactionId: transaction.id,
      userId: transaction.userId,
      credits: transaction.credits
    });

    return NextResponse.json({
      message: 'Payment verified successfully',
    });
  } catch (error) {
    backendLogger.error('Payment verification error', error);
    return NextResponse.json(
      { message: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}