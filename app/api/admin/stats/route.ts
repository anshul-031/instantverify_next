import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalVerifications, totalSales, salesByType] =
      await Promise.all([
        prisma.user.count(),
        prisma.report.count(),
        prisma.transaction.aggregate({
          where: { status: "completed" },
          _sum: { amount: true },
        }),
        prisma.transaction.groupBy({
          by: ["type"],
          where: { status: "completed" },
          _sum: { amount: true },
        }),
      ]);

    return NextResponse.json({
      totalUsers,
      totalVerifications,
      totalSales: totalSales._sum.amount || 0,
      salesByType: salesByType.reduce(
        (acc, { type, _sum }) => ({
          ...acc,
          [type]: _sum.amount || 0,
        }),
        {}
      ),
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}