import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../auth/auth-options';
import { backendLogger } from '@/lib/logger';
import { z } from 'zod';

// Only initialize S3 client if credentials are available
const s3Client = process.env.AWS_ACCESS_KEY_ID && 
                process.env.AWS_SECRET_ACCESS_KEY && 
                process.env.AWS_REGION
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

const verifySchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  documentType: z.enum(["aadhaar", "pan", "driving_license", "voter_id"], {
    required_error: "Document type is required",
    invalid_type_error: "Invalid document type",
  }),
  documentNumber: z.string().min(1, "Document number is required"),
  personPhoto: z.string().min(1, "Person photo is required"),
  documentImage: z.string().min(1, "Document image is required"),
});

async function uploadToS3(base64Data: string, key: string): Promise<string> {
  if (!s3Client || !process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) {
    throw new Error('S3 storage not configured');
  }

  const buffer = Buffer.from(
    base64Data.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  );

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    })
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      backendLogger.warn('Unauthorized verification attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = verifySchema.safeParse(body);
    if (!validationResult.success) {
      backendLogger.error('Validation error in verification request', {
        errors: validationResult.error.errors
      });
      return NextResponse.json(
        { message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { purpose, documentType, documentNumber, personPhoto, documentImage } = validationResult.data;

    // Check user credits
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

    // Check if S3 is configured
    if (!s3Client) {
      backendLogger.error('S3 storage not configured');
      return NextResponse.json(
        { message: 'Storage service not configured' },
        { status: 503 }
      );
    }

    // Upload images to S3
    const verificationId = uuidv4();
    let personPhotoUrl, documentImageUrl;

    try {
      [personPhotoUrl, documentImageUrl] = await Promise.all([
        uploadToS3(personPhoto, `${verificationId}/person.jpg`),
        uploadToS3(documentImage, `${verificationId}/document.jpg`),
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
        documentNumber,
        personPhoto: personPhotoUrl,
        documentImage: documentImageUrl,
        status: 'pending',
      },
    });

    // Deduct credit
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

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