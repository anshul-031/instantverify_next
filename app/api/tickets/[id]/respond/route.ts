import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
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

    const { message, status } = await req.json();

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    const [response] = await prisma.$transaction([
      prisma.ticketResponse.create({
        data: {
          ticketId: ticket.id,
          userId: session.user.id,
          message,
        },
      }),
      prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: status || "in-progress" },
      }),
    ]);

    return NextResponse.json({
      message: "Response added successfully",
      responseId: response.id,
    });
  } catch (error) {
    console.error("Ticket response error:", error);
    return NextResponse.json(
      { message: "Failed to add response" },
      { status: 500 }
    );
  }
}