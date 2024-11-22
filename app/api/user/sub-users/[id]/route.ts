import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../auth/auth-options';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const subUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        adminId: session.user.id,
      },
      include: {
        reports: true,
        transactions: true,
      },
    });

    if (!subUser) {
      return NextResponse.json(
        { message: 'Sub-user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subUser);
  } catch (error) {
    console.error('Sub-user fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch sub-user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Sub-user deleted successfully',
    });
  } catch (error) {
    console.error('Sub-user deletion error:', error);
    return NextResponse.json(
      { message: 'Failed to delete sub-user' },
      { status: 500 }
    );
  }
}