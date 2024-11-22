import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../auth/auth-options';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        userId: params.userId,
        grantedToId: session.user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!accessGrant) {
      return NextResponse.json(
        { message: 'Access not granted' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        reports: accessGrant.type === 'FULL',
        transactions: accessGrant.type === 'FULL',
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...user,
      accessType: accessGrant.type,
    });
  } catch (error) {
    console.error('User access fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user access' },
      { status: 500 }
    );
  }
}