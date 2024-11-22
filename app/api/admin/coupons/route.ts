import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { code, discount, minAmount, maxDiscount, validFrom, validUntil } =
      await req.json();

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discount,
        minAmount,
        maxDiscount,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Coupon creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}