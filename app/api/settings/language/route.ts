import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { language } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { language },
    });

    return NextResponse.json({ message: 'Language updated successfully' });
  } catch (error) {
    console.error('Language update error:', error);
    return NextResponse.json(
      { message: 'Failed to update language' },
      { status: 500 }
    );
  }
}
