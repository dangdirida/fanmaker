import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/posts/[postId] — 상세 (조회수 +1)
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await auth();

  const post = await prisma.post.update({
    where: { id: params.postId },
    data: { viewCount: { increment: 1 } },
    include: {
      author: { select: { id: true, nickname: true, image: true } },
      artist: { select: { id: true, name: true, nameEn: true } },
      virtualIdol: {
        select: {
          id: true, name: true, hairColor: true, hairLength: true,
          skinTone: true, eyeColor: true, outfitStyle: true, accessories: true,
          gender: true, concept: true, personality: true,
          voiceType: true, positions: true, genres: true,
        },
      },
      _count: { select: { reactions: true, comments: true } },
      reactions: session?.user?.id
        ? { where: { userId: session.user.id }, select: { type: true } }
        : false,
    },
  });

  if (!post) {
    return NextResponse.json(
      { success: false, error: "게시물을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      ...post,
      myReactions: post.reactions ? post.reactions.map((r) => r.type) : [],
      virtualIdol: post.virtualIdol ?? null,
    },
  });
}

// DELETE /api/posts/[postId] — 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    select: { authorId: true },
  });

  if (!post) {
    return NextResponse.json({ success: false, error: "없는 게시물" }, { status: 404 });
  }

  if (post.authorId !== session.user.id) {
    return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: params.postId } });

  return NextResponse.json({ success: true });
}
