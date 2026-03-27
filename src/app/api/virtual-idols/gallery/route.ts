import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const concept = searchParams.get("concept") || "";
    const _sortBy = searchParams.get("sortBy") || "latest";
    const cursor = searchParams.get("cursor") || undefined;
    const limit = 20;

    // 게시된 아이돌만 (isDraft=false, postId 존재)
    const where: Record<string, unknown> = { isDraft: false, postId: { not: null } };
    if (concept) {
      where.concept = { contains: concept };
    }

    const idols = await prisma.virtualIdol.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        name: true,
        concept: true,
        gender: true,
        stylePreset: true,
        hairColor: true,
        skinTone: true,
        eyeColor: true,
        outfitStyle: true,
        thumbnailUrl: true,
        createdAt: true,
        user: { select: { id: true, nickname: true, image: true } },
      },
    });

    const hasMore = idols.length > limit;
    const data = hasMore ? idols.slice(0, limit) : idols;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    const total = await prisma.virtualIdol.count({ where });

    return NextResponse.json({
      success: true,
      data: { idols: data, nextCursor, total },
    });
  } catch (error) {
    console.error("[gallery] Error:", error);
    const msg = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
