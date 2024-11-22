import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const subUsers = await prisma.user.findMany({
      where: {
        adminId: session.user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        credits: true,
        createdAt: true,
      },
    });

    return NextResponse.json(subUsers);
  } catch (error) {
    console.error('Sub-users fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch sub-users' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email, firstName, lastName, phone } = await req.json();

    const subUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        role: 'REGULAR',
        adminId: session.user.id,
      },
    });

    return NextResponse.json(subUser);
  } catch (error) {
    console.error('Sub-user creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create sub-user' },
      { status: 500 }
    );
  }
}