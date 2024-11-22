import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/auth-options";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        status: "read",
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      { message: "Failed to update notification" },
      { status: 500 }
    );
  }
}