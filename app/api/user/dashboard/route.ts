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

    const [
      verificationRequests,
      verificationHistory,
      credits,
      transactions,
    ] = await Promise.all([
      prisma.verificationRequest.findMany({
        where: {
          requesterId: session.user.id,
          status: 'pending',
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.report.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      }),
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      verificationRequests,
      verificationHistory,
      credits: credits?.credits || 0,
      transactions,
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}