import PDFDocument from 'pdfkit';

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerGstin?: string | null; // Updated to allow null
  customerAddress: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    gstRate: number;
  }[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export async function generateInvoice(data: InvoiceData): Promise<Buffer> {
  return new Promise(resolve => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Add company logo and details
    doc
      .fontSize(20)
      .text('InstantVerify.in', { align: 'right' })
      .fontSize(10)
      .text('GSTIN: YOUR_GSTIN_HERE', { align: 'right' })
      .text('123 Business Street', { align: 'right' })
      .text('New Delhi, 110001', { align: 'right' })
      .moveDown();

    // Add invoice details
    doc
      .fontSize(16)
      .text('TAX INVOICE', { align: 'center' })
      .moveDown()
      .fontSize(10)
      .text(`Invoice Number: ${data.invoiceNumber}`)
      .text(`Date: ${data.date.toLocaleDateString()}`)
      .moveDown();

    // Add customer details
    doc.text('Bill To:').text(data.customerName).text(data.customerAddress);

    if (data.customerGstin) {
      doc.text(`GSTIN: ${data.customerGstin}`);
    }

    doc.moveDown();

    // Add table headers
    const tableTop = doc.y;
    const itemX = 50;
    const quantityX = 250;
    const rateX = 350;
    const amountX = 450;

    doc
      .text('Description', itemX)
      .text('Qty', quantityX)
      .text('Rate', rateX)
      .text('Amount', amountX)
      .moveDown();

    // Add items
    data.items.forEach(item => {
      doc
        .text(item.description, itemX)
        .text(item.quantity.toString(), quantityX)
        .text(item.rate.toFixed(2), rateX)
        .text(item.amount.toFixed(2), amountX)
        .moveDown();
    });

    // Add totals
    const totalsY = doc.y + 20;
    doc
      .text('Subtotal:', 350, totalsY)
      .text(data.subtotal.toFixed(2), amountX, totalsY)
      .text('CGST:', 350, totalsY + 20)
      .text(data.cgst.toFixed(2), amountX, totalsY + 20)
      .text('SGST:', 350, totalsY + 40)
      .text(data.sgst.toFixed(2), amountX, totalsY + 40)
      .text('IGST:', 350, totalsY + 60)
      .text(data.igst.toFixed(2), amountX, totalsY + 60)
      .text('Total:', 350, totalsY + 80)
      .text(data.total.toFixed(2), amountX, totalsY + 80);

    // Add footer
    doc
      .fontSize(8)
      .text(
        'This is a computer-generated invoice and does not require a signature.',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    doc.end();
  });
}
