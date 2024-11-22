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

    const { type, enabled } = await req.json();

    // Update user's notification preferences
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        [`${type}Notifications`]: enabled,
      },
    });

    return NextResponse.json({
      message: 'Notification settings updated successfully',
    });
  } catch (error) {
    console.error('Notification settings update error:', error);
    return NextResponse.json(
      { message: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}