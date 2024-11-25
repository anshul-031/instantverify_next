import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    backendLogger.info('Access grant request received');
    
    if (!session) {
      backendLogger.warn('Unauthorized access grant attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email, type } = await req.json();
    backendLogger.debug('Processing access grant request', { 
      grantorId: session.user.id,
      granteeEmail: email,
      type 
    });

    const grantedToUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!grantedToUser) {
      backendLogger.warn('Access grant failed - user not found', { email });
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const accessGrant = await prisma.accessGrant.create({
      data: {
        userId: session.user.id,
        grantedToId: grantedToUser.id,
        type,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    backendLogger.info('Access grant created successfully', {
      grantId: accessGrant.id,
      grantorId: session.user.id,
      granteeId: grantedToUser.id
    });

    return NextResponse.json(accessGrant);
  } catch (error) {
    backendLogger.error('Access grant creation failed', {
      error,
      userId: session?.user?.id
    });
    return NextResponse.json(
      { message: 'Failed to grant access' },
      { status: 500 }
    );
  }
}