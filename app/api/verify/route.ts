import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../auth/auth-options';

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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      purpose,
      documentType,
      documentNumber,
      personPhoto,
      documentImage,
    } = body;

    // Check user credits
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

    // Check if S3 is configured
    if (!s3Client) {
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
    } catch (error) {
      console.error('S3 upload error:', error);
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
        verificationId,
        status: 'pending',
      },
    });

    // Deduct credits
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json({
      message: 'Verification initiated',
      verificationId: report.verificationId,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}