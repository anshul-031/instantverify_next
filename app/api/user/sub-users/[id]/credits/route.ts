import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../../auth/auth-options';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { credits } = await req.json();

    const subUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        adminId: session.user.id,
      },
    });

    if (!subUser) {
      return NextResponse.json(
        { message: 'Sub-user not found' },
        { status: 404 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!admin || admin.credits < credits) {
      return NextResponse.json(
        { message: 'Insufficient credits' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: admin.id },
        data: { credits: { decrement: credits } },
      }),
      prisma.user.update({
        where: { id: subUser.id },
        data: { credits: { increment: credits } },
      }),
      prisma.transaction.create({
        data: {
          userId: admin.id,
          type: 'credit_transfer',
          amount: 0,
          credits: credits,
          status: 'completed',
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Credits transferred successfully',
    });
  } catch (error) {
    console.error('Credit transfer error:', error);
    return NextResponse.json(
      { message: 'Failed to transfer credits' },
      { status: 500 }
    );
  }
}