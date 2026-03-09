import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE /api/admin/posts/[postId] — 게시물 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
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

  const { postId } = await params;

  await prisma.post.delete({ where: { id: postId } });

  return NextResponse.json({ success: true, data: { id: postId } });
}
