import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      transactionId,
    } = await req.json();

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "failed" },
      });
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "completed" },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            increment: transaction.credits,
          },
        },
      }),
    ]);

    return NextResponse.json({ message: "Payment verified successfully" });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}