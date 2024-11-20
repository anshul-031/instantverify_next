import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount, credits } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: "credit_purchase",
        amount,
        credits,
        status: "pending",
        paymentId: order.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { message: "Failed to create payment" },
      { status: 500 }
    );
  }
}