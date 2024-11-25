import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    backendLogger.info('Access grants list request received');
    
    if (!session) {
      backendLogger.warn('Unauthorized access grants list attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    backendLogger.debug('Fetching access grants', { userId: session.user.id });
    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        grantedTo: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    backendLogger.info('Access grants fetched successfully', { 
      userId: session.user.id,
      grantsCount: accessGrants.length 
    });

    return NextResponse.json(accessGrants);
  } catch (error) {
    backendLogger.error('Failed to fetch access grants', {
      error,
      userId: session?.user?.id
    });
    return NextResponse.json(
      { message: 'Failed to fetch access grants' },
      { status: 500 }
    );
  }
}