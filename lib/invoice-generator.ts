import { jsPDF } from 'jspdf';

interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  userId: string;
}

export async function generateInvoicePDF(transaction: Transaction): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Add company logo and details
  doc.setFontSize(20);
  doc.text('InstantVerify.in', 20, 20);
  
  doc.setFontSize(12);
  doc.text('GST Invoice', 20, 30);
  
  // Add invoice details
  doc.text(`Invoice Number: INV-${transaction.id}`, 20, 50);
  doc.text(`Date: ${new Date(transaction.createdAt).toLocaleDateString()}`, 20, 60);
  
  // Add amount details
  const amount = transaction.amount;
  const gst = amount * 0.18;
  const total = amount + gst;
  
  doc.text('Amount Details:', 20, 80);
  doc.text(`Base Amount: ₹${amount.toFixed(2)}`, 30, 90);
  doc.text(`GST (18%): ₹${gst.toFixed(2)}`, 30, 100);
  doc.text(`Total Amount: ₹${total.toFixed(2)}`, 30, 110);
  
  // Add terms and conditions
  doc.text('Terms & Conditions:', 20, 140);
  doc.setFontSize(10);
  doc.text('1. This is a computer-generated invoice.', 30, 150);
  doc.text('2. All amounts are in Indian Rupees.', 30, 160);
  
  // Add footer
  doc.setFontSize(8);
  doc.text('InstantVerify.in | GSTIN: XXXXXXXXXXXX', 20, 280);
  
  return Buffer.from(doc.output('arraybuffer'));
}