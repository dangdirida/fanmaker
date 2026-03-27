import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    const idol = await prisma.virtualIdol.findUnique({
      where: { id },
      select: {
        gender: true,
        hairColor: true,
        skinTone: true,
        eyeColor: true,
        outfitStyle: true,
      },
    });

    if (!idol) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, data: idol });
  } catch (error) {
    console.error("[GET /api/virtual-idols/preview] Error:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
