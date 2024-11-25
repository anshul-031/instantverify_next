import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    backendLogger.info('Admin coupons list request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      backendLogger.warn('Unauthorized access attempt to admin coupons', {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    backendLogger.debug('Fetching all coupons');
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    backendLogger.info('Coupons fetched successfully', {
      count: coupons.length
    });

    return NextResponse.json(coupons);
  } catch (error) {
    backendLogger.error('Failed to fetch coupons', { error });
    return NextResponse.json(
      { message: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    backendLogger.info('Admin coupon creation request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      backendLogger.warn('Unauthorized coupon creation attempt', {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { code, discount, minAmount, maxDiscount, validFrom, validUntil } =
      await req.json();

    backendLogger.debug('Creating new coupon', {
      code,
      discount,
      minAmount,
      maxDiscount
    });

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

    backendLogger.info('Coupon created successfully', {
      couponId: coupon.id,
      code: coupon.code
    });

    return NextResponse.json(coupon);
  } catch (error) {
    backendLogger.error('Coupon creation failed', { error });
    return NextResponse.json(
      { message: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}