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

    const pricing = await prisma.verificationPrice.findMany();
    return NextResponse.json(pricing);
  } catch (error) {
    console.error('Pricing fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { type, basePrice, userSpecificPricing } = await req.json();

    const pricing = await prisma.verificationPrice.upsert({
      where: { type },
      update: {
        basePrice,
        userSpecificPrices: userSpecificPricing,
      },
      create: {
        type,
        basePrice,
        userSpecificPrices: userSpecificPricing,
      },
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error('Pricing update error:', error);
    return NextResponse.json(
      { message: 'Failed to update pricing' },
      { status: 500 }
    );
  }
}