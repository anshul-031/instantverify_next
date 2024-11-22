import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: {
          lte: new Date(),
        },
        validUntil: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
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