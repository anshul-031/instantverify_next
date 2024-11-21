import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';
import { authOptions } from '../auth/auth-options';

// Only initialize Razorpay if credentials are available
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if Razorpay is properly configured
    if (!razorpay) {
      return NextResponse.json(
        { message: 'Payment service not configured' },
        { status: 503 }
      );
    }

    const { amount, credits } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'credit_purchase',
        amount,
        credits,
        status: 'pending',
        paymentId: order.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { message: 'Failed to create payment' },
      { status: 500 }
    );
  }
}