import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = 20;

    const posts = await prisma.post.findMany({
      where: {
        authorId: params.userId,
        isPublic: true,
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, nickname: true, image: true },
        },
        artist: {
          select: { id: true, name: true },
        },
        _count: {
          select: { reactions: true, comments: true },
        },
        ...(session?.user?.id
          ? {
              reactions: {
                where: { userId: session.user.id },
                select: { type: true },
              },
            }
          : {}),
      },
    });

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      category: post.category,
      thumbnailUrl: post.thumbnailUrl,
      viewCount: post.viewCount,
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      artist: post.artist,
      reactionCount: post._count.reactions,
      commentCount: post._count.comments,
      myReactions: "reactions" in post
        ? (post.reactions as { type: string }[]).map((r) => r.type)
        : [],
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      nextCursor,
    });
  } catch (error) {
    console.error("사용자 게시물 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "게시물을 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
