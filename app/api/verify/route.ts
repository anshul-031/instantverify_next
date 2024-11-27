import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/auth-options';
import { backendLogger } from '@/lib/logger';
import { verifySchema, type VerifyRequest } from '@/lib/verify/validation';
import { uploadToS3 } from '@/lib/verify/s3-upload';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    backendLogger.info('Verification request received');
    
    if (!session) {
      backendLogger.warn('Unauthorized verification attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log("body : ", body);
    // Validate request body
    const validationResult = verifySchema.safeParse(body);
    console.log("validationResult : ", validationResult);
    if (!validationResult.success) {
      backendLogger.error('Validation error in verification request', {
        errors: validationResult.error.errors
      });
      return NextResponse.json(
        { message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { purpose, documentType, documentNumber, personPhoto, documentImage, useCredits } = validationResult.data;

    // Check user credits if useCredits is true
    if (useCredits) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      if (!user || user.credits < 1) {
        backendLogger.warn('Insufficient credits for verification', {
          userId: session.user.id,
          credits: user?.credits
        });
        return NextResponse.json(
          { message: 'Insufficient credits' },
          { status: 400 }
        );
      }
    }

    // Upload images to S3
    const verificationId = uuidv4();
    let personPhotoUrl, documentImageUrl;

    try {
      [personPhotoUrl, documentImageUrl] = await Promise.all([
        uploadToS3(personPhoto, `${verificationId}/person.jpg`),
        uploadToS3(documentImage || "", `${verificationId}/document.jpg`),
      ]);

      backendLogger.info('Successfully uploaded verification images', {
        verificationId
      });
    } catch (error) {
      backendLogger.error('Failed to upload images to S3', {
        error,
        verificationId
      });
      return NextResponse.json(
        { message: 'Failed to upload images' },
        { status: 500 }
      );
    }

    // Create verification report
    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        purpose,
        documentType,
        verificationType: documentType,
        documentNumber,
        personPhoto: personPhotoUrl,
        documentImage: documentImageUrl,
        status: 'pending',
        paymentStatus: useCredits ? 'completed' : 'pending'
      },
    });

    // Deduct credit if useCredits is true
    if (useCredits) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: 1 } },
      });
    }

    backendLogger.info('Verification initiated successfully', {
      verificationId: report.id,
      userId: session.user.id,
      documentType
    });

    return NextResponse.json({
      message: 'Verification initiated',
      verificationId: report.id,
    });
  } catch (error) {
    backendLogger.error('Verification error', { error });
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}