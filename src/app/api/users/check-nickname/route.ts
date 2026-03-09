import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const nickname = req.nextUrl.searchParams.get("nickname");

  if (!nickname || nickname.length < 2 || nickname.length > 20) {
    return NextResponse.json(
      { success: false, available: false, error: "닉네임은 2~20자여야 합니다" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { nickname },
    select: { id: true },
  });

  return NextResponse.json({
    success: true,
    available: !existing,
  });
}
