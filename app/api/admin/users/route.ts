import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';
import { backendLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    backendLogger.info('Admin users list request received');
    
    const session = await getServerSession(authOptions);
    if (
      !session?.user?.role ||
      !['ADMIN', 'OWNER'].includes(session.user.role)
    ) {
      backendLogger.warn('Unauthorized users list access attempt', {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    backendLogger.debug('Fetching all users');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        credits: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    backendLogger.info('Users fetched successfully', {
      count: users.length
    });

    return NextResponse.json(users);
  } catch (error) {
    backendLogger.error('Failed to fetch users', { error });
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}