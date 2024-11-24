import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { authOptions } from "../../../auth/auth-options";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id: params.id },
      include: { responses: true },
    });

    if (!contactRequest) {
      return NextResponse.json(
        { message: "Contact request not found" },
        { status: 404 }
      );
    }

    const response = await prisma.contactResponse.create({
      data: {
        contactRequestId: contactRequest.id,
        userId: session.user.id,
        message,
      },
    });

    // Update contact request status
    await prisma.contactRequest.update({
      where: { id: contactRequest.id },
      data: { status: "RESPONDED" },
    });

    // Send email notification to the requestor
    await sendEmail({
      to: contactRequest.email,
      subject: "Response to Your Contact Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Response to Your Contact Request</h2>
          <p>We have responded to your contact request. Click the link below to view the response:</p>
          <p><a href="${process.env.NEXTAUTH_URL}/contact/responses/${contactRequest.id}">View Response</a></p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Response sent successfully",
      responseId: response.id,
    });
  } catch (error) {
    console.error("Contact response error:", error);
    return NextResponse.json(
      { message: "Failed to send response" },
      { status: 500 }
    );
  }
}