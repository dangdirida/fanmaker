import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        nickname: true,
        image: true,
        bio: true,
        activityType: true,
        role: true,
        isPro: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 현재 로그인 사용자가 이 프로필을 팔로우하고 있는지 확인
    let isFollowing = false;
    if (session?.user?.id && session.user.id !== params.userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: params.userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    const { _count, ...userData } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        followerCount: _count.followers,
        followingCount: _count.following,
        postCount: _count.posts,
        isFollowing,
      },
    });
  } catch (error) {
    console.error("프로필 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "프로필을 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
