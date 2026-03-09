import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { artistId: string } }
) {
  const session = await auth();

  const artist = await prisma.artist.findUnique({
    where: { id: params.artistId },
    include: {
      _count: { select: { artistFollows: true, posts: true } },
    },
  });

  if (!artist) {
    return NextResponse.json(
      { success: false, error: "아티스트를 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  let isFollowing = false;
  if (session?.user?.id) {
    const follow = await prisma.artistFollow.findUnique({
      where: {
        userId_artistId: { userId: session.user.id, artistId: params.artistId },
      },
    });
    isFollowing = !!follow;
  }

  return NextResponse.json({
    success: true,
    data: {
      ...artist,
      followerCount: artist._count.artistFollows,
      postCount: artist._count.posts,
      isFollowing,
    },
  });
}
