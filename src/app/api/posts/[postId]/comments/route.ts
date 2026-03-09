import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/posts/[postId]/comments — 댓글 목록
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const comments = await prisma.comment.findMany({
    where: { postId: params.postId, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, nickname: true, image: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, nickname: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: comments });
}

// POST /api/posts/[postId]/comments — 댓글 작성
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const { content, parentId } = await req.json();

  if (!content || content.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "댓글 내용을 입력해주세요" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      postId: params.postId,
      authorId: session.user.id,
      content: content.trim(),
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, nickname: true, image: true } },
    },
  });

  return NextResponse.json({ success: true, data: comment }, { status: 201 });
}
