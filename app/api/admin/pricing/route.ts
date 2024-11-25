import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    backendLogger.info('Admin pricing fetch request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      backendLogger.warn('Unauthorized pricing access attempt', {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    backendLogger.debug('Fetching verification prices');
    const pricing = await prisma.verificationPrice.findMany();

    backendLogger.info('Pricing fetched successfully', {
      count: pricing.length
    });

    return NextResponse.json(pricing);
  } catch (error) {
    backendLogger.error('Failed to fetch pricing', { error });
    return NextResponse.json(
      { message: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    backendLogger.info('Admin pricing update request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'OWNER') {
      backendLogger.warn('Unauthorized pricing update attempt', {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { type, basePrice, userSpecificPricing } = await req.json();

    backendLogger.debug('Updating verification price', {
      type,
      basePrice,
      hasUserSpecificPricing: !!userSpecificPricing
    });

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

    backendLogger.info('Pricing updated successfully', {
      type,
      priceId: pricing.id
    });

    return NextResponse.json(pricing);
  } catch (error) {
    backendLogger.error('Pricing update failed', { error });
    return NextResponse.json(
      { message: 'Failed to update pricing' },
      { status: 500 }
    );
  }
}