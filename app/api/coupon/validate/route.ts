import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions); <boltAction type="file" filePath="app/api/coupon/validate/route.ts">    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { code, amount } = await req.json();

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        isActive: true,
        validFrom: {
          lte: new Date(),
        },
        validUntil: {
          gte: new Date(),
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: 'Invalid or expired coupon' },
        { status: 400 }
      );
    }

    if (amount < coupon.minAmount) {
      return NextResponse.json(
        { message: `Minimum amount required: ₹${coupon.minAmount}` },
        { status: 400 }
      );
    }

    const discountAmount = Math.min(
      (amount * coupon.discount) / 100,
      coupon.maxDiscount
    );

    return NextResponse.json({
      ...coupon,
      discountAmount,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { message: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}