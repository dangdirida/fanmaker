import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/admin/users — 유저 목록 (페이지네이션 + 검색)
export async function GET(req: NextRequest) {
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

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") || "";

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { nickname: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        image: true,
        activityType: true,
        role: true,
        isPro: true,
        isSuspended: true,
        createdAt: true,
        password: true,
        accounts: {
          select: { provider: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const usersWithAuth = users.map(({ password, accounts, ...user }) => {
    const providers = accounts.map((a) => a.provider);
    const hasPassword = !!password;
    let authMethod = "이메일";
    if (providers.length > 0 && hasPassword) {
      authMethod = providers.join(", ") + " + 이메일";
    } else if (providers.length > 0) {
      authMethod = providers.join(", ");
    }
    return { ...user, authMethod };
  });

  return NextResponse.json({
    success: true,
    data: usersWithAuth,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
