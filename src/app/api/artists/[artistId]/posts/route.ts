import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PostCategory, Prisma } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { artistId: string } }
) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "latest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const session = await auth();

  const where: Prisma.PostWhereInput = {
    artistId: params.artistId,
    isPublic: true,
  };

  if (category) {
    where.category = category as PostCategory;
  }

  const orderBy: Prisma.PostOrderByWithRelationInput =
    sort === "popular" ? { viewCount: "desc" } : { createdAt: "desc" };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: { select: { id: true, nickname: true, image: true } },
        artist: { select: { id: true, name: true } },
        _count: { select: { reactions: true, comments: true } },
        reactions: session?.user?.id
          ? { where: { userId: session.user.id }, select: { type: true } }
          : false,
      },
    }),
    prisma.post.count({ where }),
  ]);

  const data = posts.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    category: post.category,
    thumbnailUrl: post.thumbnailUrl,
    viewCount: post.viewCount,
    createdAt: post.createdAt,
    author: post.author,
    artist: post.artist,
    reactionCount: post._count.reactions,
    commentCount: post._count.comments,
    myReactions: post.reactions ? post.reactions.map((r) => r.type) : [],
  }));

  return NextResponse.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
