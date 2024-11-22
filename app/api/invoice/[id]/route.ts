import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { generateInvoice } from '@/lib/invoice-generator';
import { authOptions } from '../../auth/auth-options';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'completed',
      },
      include: {
        user: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    const invoiceData = {
      invoiceNumber: `INV-${transaction.id}`,
      date: transaction.createdAt,
      customerName: `${transaction.user.firstName} ${transaction.user.lastName}`,
      customerAddress: transaction.user.address || 'Address not provided',
      customerGstin: transaction.user.gstin,
      items: [
        {
          description: `${transaction.credits} Verification Credits`,
          quantity: 1,
          rate: transaction.amount,
          amount: transaction.amount,
          gstRate: 18, // 18% GST
        },
      ],
      subtotal: transaction.amount,
      cgst: transaction.amount * 0.09, // 9% CGST
      sgst: transaction.amount * 0.09, // 9% SGST
      igst: 0, // 0% IGST (for same state transactions)
      total: transaction.amount * 1.18, // Total including 18% GST
    };

    const pdfBuffer = await generateInvoice(invoiceData);

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