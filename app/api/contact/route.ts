import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { authOptions } from "../auth/auth-options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { name, email, phone, message } = await req.json();

    const contactRequest = await prisma.contactRequest.create({
      data: {
        name,
        email,
        phone,
        message,
        userId: session?.user?.id,
      },
    });

    // Send email notification to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: "New Contact Request",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Contact Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <p>You can respond to this request through the admin dashboard.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: "Contact request submitted successfully",
      requestId: contactRequest.id,
    });
  } catch (error) {
    console.error("Contact request error:", error);
    return NextResponse.json(
      { message: "Failed to submit contact request" },
      { status: 500 }
    );
  }
}