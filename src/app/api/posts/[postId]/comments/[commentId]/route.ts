import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE /api/posts/[postId]/comments/[commentId] — 댓글 삭제 (본인만)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const comment = await prisma.comment.findUnique({
    where: { id: params.commentId },
    select: { authorId: true },
  });

  if (!comment) {
    return NextResponse.json(
      { success: false, error: "댓글을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  if (comment.authorId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: "본인의 댓글만 삭제할 수 있습니다" },
      { status: 403 }
    );
  }

  await prisma.comment.delete({ where: { id: params.commentId } });

  return NextResponse.json({ success: true });
}
