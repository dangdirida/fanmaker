import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/stats — 어드민 대시보드 통계
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "권한이 없습니다" },
      { status: 403 }
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    todayUsers,
    totalPosts,
    todayPosts,
    proUsers,
    totalAIJobs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.post.count(),
    prisma.post.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { isPro: true } }),
    prisma.aIJob.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalUsers,
      todayUsers,
      totalPosts,
      todayPosts,
      proUsers,
      totalAIJobs,
    },
  });
}
