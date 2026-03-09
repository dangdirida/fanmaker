import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/notices — 공지사항 목록
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

  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      artist: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ success: true, data: notices });
}

// POST /api/admin/notices — 공지사항 생성
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
  const { title, content, isPinned } = body;

  if (!title || !content) {
    return NextResponse.json(
      { success: false, error: "제목과 내용은 필수입니다" },
      { status: 400 }
    );
  }

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      isPublic: isPinned ?? true,
    },
  });

  return NextResponse.json({ success: true, data: notice }, { status: 201 });
}
