import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../auth/auth-options';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!accessGrant) {
      return NextResponse.json(
        { message: 'Access grant not found' },
        { status: 404 }
      );
    }

    await prisma.accessGrant.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Access revoked successfully',
    });
  } catch (error) {
    console.error('Access revoke error:', error);
    return NextResponse.json(
      { message: 'Failed to revoke access' },
      { status: 500 }
    );
  }
}