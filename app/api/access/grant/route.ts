import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email, type } = await req.json();

    const grantedToUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!grantedToUser) {
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

    return NextResponse.json(accessGrant);
  } catch (error) {
    console.error('Access grant error:', error);
    return NextResponse.json(
      { message: 'Failed to grant access' },
      { status: 500 }
    );
  }
}