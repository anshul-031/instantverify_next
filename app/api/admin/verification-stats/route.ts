import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    backendLogger.info('Verification stats request received');
    
    const session = await getServerSession(authOptions);
    if (
      !session?.user?.role ||
      !['ADMIN', 'OWNER'].includes(session.user.role)
    ) {
      backendLogger.warn('Unauthorized verification stats access attempt', {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    backendLogger.debug('Fetching verification statistics');
    const stats = await prisma.report.groupBy({
      by: ['status'],
      _count: true,
    });

    const result = stats.reduce(
      (acc, { status, _count }) => ({
        ...acc,
        [status.toLowerCase()]: _count,
      }),
      { pending: 0, completed: 0, failed: 0 }
    );

    backendLogger.info('Verification stats fetched successfully', result);

    return NextResponse.json(result);
  } catch (error) {
    backendLogger.error('Failed to fetch verification stats', { error });
    return NextResponse.json(
      { message: 'Failed to fetch verification stats' },
      { status: 500 }
    );
  }
}