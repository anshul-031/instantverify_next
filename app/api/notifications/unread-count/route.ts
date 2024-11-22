import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/auth-options";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        status: "unread",
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unread count error:", error);
    return NextResponse.json(
      { message: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}