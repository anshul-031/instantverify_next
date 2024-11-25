import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/lib/email';
import { authOptions } from '../auth/auth-options';
import { getDomainUrl } from '@/lib/utils';

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
        type,
        link,
        email,
        status: 'pending',
        expiresAt,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

    const baseUrl = getDomainUrl(req);
    const verificationLink = `${baseUrl}/verify/${link}`;

    await sendEmail({
      to: email,
      subject: 'Verification Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #1a56db; text-align: center;">InstantVerify.in</h1>
          <p>You have received a verification request.</p>
          <p>Click the link below to complete your verification:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Complete Verification</a>
          </div>
          <p>This link will expire in 14 days.</p>
          <p>If you didn't expect this verification request, you can safely ignore this email.</p>
          <p>Best regards,<br>The InstantVerify.in Team</p>
        </div>
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