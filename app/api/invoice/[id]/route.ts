import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
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

    // Generate GST invoice HTML
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GST Invoice - InstantVerify.in</title>
          <style>
            /* Add your invoice styling here */
          </style>
        </head>
        <body>
          <div class="invoice">
            <h1>Tax Invoice</h1>
            <div class="header">
              <div>
                <h2>InstantVerify.in</h2>
                <p>GSTIN: YOUR_GSTIN</p>
                <!-- Add your company details -->
              </div>
              <div>
                <p>Invoice No: INV-${transaction.id}</p>
                <p>Date: ${new Date(transaction.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div class="customer">
              <h3>Bill To:</h3>
              <p>${transaction.user.firstName} ${transaction.user.lastName}</p>
              <!-- Add more customer details -->
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>GST (18%)</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Verification Credits</td>
                  <td>₹${transaction.amount}</td>
                  <td>₹${transaction.amount * 0.18}</td>
                  <td>₹${transaction.amount * 1.18}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
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