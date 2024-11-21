import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user?.role ||
      !['ADMIN', 'OWNER'].includes(session.user.role)
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Verification stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch verification stats' },
      { status: 500 }
    );
  }
}