import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/auth-options";
import { backendLogger } from "@/lib/logger";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  try {
    backendLogger.info("Access revoke request received", {
      grantId: params.id,
    });

    if (!session) {
      backendLogger.warn("Unauthorized access revoke attempt", {
        grantId: params.id,
      });
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    backendLogger.debug("Finding access grant", {
      grantId: params.id,
      userId: session.user.id,
    });

    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!accessGrant) {
      backendLogger.warn("Access grant not found for revocation", {
        grantId: params.id,
        userId: session.user.id,
      });
      return NextResponse.json(
        { message: "Access grant not found" },
        { status: 404 }
      );
    }

    await prisma.accessGrant.delete({
      where: { id: params.id },
    });

    backendLogger.info("Access grant revoked successfully", {
      grantId: params.id,
      userId: session.user.id,
    });

    return NextResponse.json({
      message: "Access revoked successfully",
    });
  } catch (error) {
    backendLogger.error("Access revocation failed", {
      error,
      grantId: params.id,
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { message: "Failed to revoke access" },
      { status: 500 }
    );
  }
}
