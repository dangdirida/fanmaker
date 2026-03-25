import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PostCategory, Prisma } from "@prisma/client";

// GET /api/posts — 목록
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tab = searchParams.get("tab") || "all";
  const category = searchParams.get("category") || "";
  const artistId = searchParams.get("artistId") || "";
  const sort = searchParams.get("sort") || "latest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const session = await auth();

  const where: Prisma.PostWhereInput = { isPublic: true };

  if (category && category !== "all") {
    where.category = category as PostCategory;
  }

  if (artistId) {
    where.artistId = artistId;
  }

  // 팔로잉 탭: 내가 팔로우한 유저의 게시물
  if (tab === "following" && session?.user?.id) {
    const followingIds = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    where.authorId = { in: followingIds.map((f) => f.followingId) };
  }

  const orderBy: Prisma.PostOrderByWithRelationInput =
    sort === "popular" ? { viewCount: "desc" } : { createdAt: "desc" };

  // 트렌딩: 최근 7일 + 반응 많은 순
  if (tab === "trending") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    where.createdAt = { gte: sevenDaysAgo };
  }

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
    contentData: post.contentData,
  }));

  return NextResponse.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/posts — 창작물 게시
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { title, description, category, artistId, thumbnailUrl, contentData, fileUrls, tags } = body;

  if (!title || !category) {
    return NextResponse.json(
      { success: false, error: "제목과 카테고리는 필수입니다" },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      title,
      description: description || null,
      category: category as PostCategory,
      artistId: artistId || null,
      thumbnailUrl: thumbnailUrl || null,
      contentData: contentData || {},
      fileUrls: fileUrls || [],
      tags: tags || [],
    },
  });

  return NextResponse.json({ success: true, data: post }, { status: 201 });
}
