import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

// PATCH /api/admin/users/[userId] — 유저 역할 변경
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

  const { userId } = await params;
  const body = await req.json();
  const { role } = body;

  if (!role || !Object.values(Role).includes(role)) {
    return NextResponse.json(
      { success: false, error: "유효하지 않은 역할입니다" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, nickname: true, role: true },
  });

  return NextResponse.json({ success: true, data: user });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
  }
  const { userId } = await params;
  // 자기 자신은 삭제 불가
  if (userId === session.user.id) {
    return NextResponse.json({ success: false, error: "자기 자신은 삭제할 수 없습니다" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
