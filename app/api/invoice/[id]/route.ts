import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/auth-options';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import featureFlags from '@/config/feature-flags';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!featureFlags.ENABLE_GST_INVOICE) {
      return NextResponse.json(
        { message: 'Feature not available' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'completed',
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateInvoicePDF(transaction);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${transaction.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { message: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}