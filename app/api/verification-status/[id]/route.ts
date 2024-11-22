import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/auth-options";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verification = await prisma.verificationRequest.findFirst({
      where: {
        OR: [
          { id: params.id },
          { link: params.id }
        ],
        requesterId: session.user.id,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { message: "Verification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Verification status error:", error);
    return NextResponse.json(
      { message: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}