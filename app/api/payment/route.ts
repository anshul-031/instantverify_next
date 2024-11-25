import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';
import { authOptions } from '../auth/auth-options';
import { backendLogger } from '@/lib/logger';

// Initialize Razorpay with proper error handling
const initializeRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    backendLogger.error('Razorpay credentials not configured');
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      backendLogger.error('Unauthorized payment attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const razorpay = initializeRazorpay();
    if (!razorpay) {
      backendLogger.error('Razorpay initialization failed');
      return NextResponse.json(
        { message: 'Payment service not configured' },
        { status: 503 }
      );
    }

    const { amount, credits } = await req.json();
    backendLogger.info('Creating payment order', { amount, credits });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    backendLogger.info('Payment order created', { orderId: order.id });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'credit_purchase',
        amount: Number(amount),
        credits,
        status: 'pending',
        paymentId: order.id,
      },
    });

    backendLogger.info('Transaction record created', { 
      transactionId: transaction.id,
      orderId: order.id 
    });

    return NextResponse.json({
      orderId: order.id,
      transactionId: transaction.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    backendLogger.error('Payment creation error', error);
    return NextResponse.json(
      { message: 'Failed to create payment' },
      { status: 500 }
    );
  }
}