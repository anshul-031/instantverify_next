import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    backendLogger.info('Admin stats fetch request received');
    
    const session = await getServerSession(authOptions);
    if (
      !session?.user?.role ||
      !['ADMIN', 'OWNER'].includes(session.user.role)
    ) {
      backendLogger.warn('Unauthorized stats access attempt', {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    backendLogger.debug('Fetching admin dashboard stats');
    const [totalUsers, totalVerifications, totalSales, salesByType] =
      await Promise.all([
        prisma.user.count(),
        prisma.report.count(),
        prisma.transaction.aggregate({
          where: { status: 'completed' },
          _sum: { amount: true },
        }),
        prisma.transaction.groupBy({
          by: ['type'],
          where: { status: 'completed' },
          _sum: { amount: true },
        }),
      ]);

    const stats = {
      totalUsers,
      totalVerifications,
      totalSales: totalSales._sum.amount || 0,
      salesByType: salesByType.reduce(
        (acc, { type, _sum }) => ({
          ...acc,
          [type]: _sum.amount || 0,
        }),
        {}
      ),
    };

    backendLogger.info('Admin stats fetched successfully', stats);

    return NextResponse.json(stats);
  } catch (error) {
    backendLogger.error('Failed to fetch admin stats', { error });
    return NextResponse.json(
      { message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}