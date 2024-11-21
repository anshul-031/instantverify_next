import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/lib/email';
import { authOptions } from '../auth/auth-options';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email, type } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user || user.credits < 1) {
      return NextResponse.json(
        { message: 'Insufficient credits' },
        { status: 400 }
      );
    }

    const link = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 14 days from now

    const request = await prisma.verificationRequest.create({
      data: {
        requesterId: session.user.id,
        email,
        type,
        link,
        status: 'pending',
        expiresAt,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

    const verificationLink = `${process.env.NEXTAUTH_URL}/verify/${link}`;

    await sendEmail({
      to: email,
      subject: 'Verification Request',
      html: `
        <p>You have received a verification request.</p>
        <p>Click the link below to complete your verification:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 14 days.</p>
      `,
    });

    return NextResponse.json({
      message: 'Verification request sent successfully',
      requestId: request.id,
    });
  } catch (error) {
    console.error('Verification request error:', error);
    return NextResponse.json(
      { message: 'Failed to create verification request' },
      { status: 500 }
    );
  }
}
