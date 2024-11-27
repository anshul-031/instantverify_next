import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { backendLogger } from '@/lib/logger';

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

export async function uploadToS3(base64Data: string, key: string): Promise<string> {
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