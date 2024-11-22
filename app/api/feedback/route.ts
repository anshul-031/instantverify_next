import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/auth-options';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { feedback } = await req.json();

    if (!feedback) {
      return NextResponse.json(
        { message: 'Feedback is required' },
        { status: 400 }
      );
    }

    // Store feedback with user info if available
    await prisma.feedback.create({
      data: {
        content: feedback,
        userId: session?.user?.id,
      },
    });

    return NextResponse.json({
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { message: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}