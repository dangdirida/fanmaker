import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/artists — 아티스트 목록
export async function GET() {
  const artists = await prisma.artist.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { artistFollows: true } },
    },
  });

  return NextResponse.json({ success: true, data: artists });
}
