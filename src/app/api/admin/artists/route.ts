import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/admin/artists — 아티스트 추가
export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const { name, nameEn, debutDate, members, agency } = body;

  if (!name) {
    return NextResponse.json(
      { success: false, error: "아티스트 이름은 필수입니다" },
      { status: 400 }
    );
  }

  const artist = await prisma.artist.create({
    data: {
      name,
      nameEn: nameEn || null,
      debutDate: debutDate ? new Date(debutDate) : null,
      members: members || null,
      agency: agency || null,
    },
  });

  return NextResponse.json({ success: true, data: artist }, { status: 201 });
}
