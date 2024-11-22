import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/auth-options";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        status: "unread",
      },
      data: {
        status: "read",
      },
    });

    return NextResponse.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { message: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}