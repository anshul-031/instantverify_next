import { NextResponse } from 'next/server';

const BASE_PRICE = 100; // Base price in INR
const DISCOUNT_PERCENTAGE = 80; // Current discount percentage
const GST_PERCENTAGE = 18; // GST percentage

export async function GET() {
  try {
    const discountedPrice = BASE_PRICE * (1 - DISCOUNT_PERCENTAGE / 100);
    const gstAmount = discountedPrice * (GST_PERCENTAGE / 100);
    const finalPrice = discountedPrice + gstAmount;

    return NextResponse.json({
      basePrice: BASE_PRICE,
      discountPercentage: DISCOUNT_PERCENTAGE,
      discountedPrice: discountedPrice,
      gstPercentage: GST_PERCENTAGE,
      gstAmount: gstAmount,
      finalPrice: finalPrice,
      currency: "INR"
    });
  } catch (error) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { message: 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}