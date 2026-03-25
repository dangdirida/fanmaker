import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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
}
