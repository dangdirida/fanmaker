import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== params.userId) {
      return NextResponse.json(
        { success: false, error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { nickname, bio, image } = body;

    // 닉네임 유효성 검사
    if (nickname !== undefined) {
      if (typeof nickname !== "string" || nickname.trim().length < 2 || nickname.trim().length > 20) {
        return NextResponse.json(
          { success: false, error: "닉네임은 2~20자로 입력해주세요" },
          { status: 400 }
        );
      }

      // 닉네임 중복 확인
      const existing = await prisma.user.findFirst({
        where: { nickname: nickname.trim(), NOT: { id: params.userId } },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "이미 사용 중인 닉네임입니다" },
          { status: 409 }
        );
      }
    }

    // bio 유효성 검사
    if (bio !== undefined && typeof bio === "string" && bio.length > 150) {
      return NextResponse.json(
        { success: false, error: "자기소개는 150자 이하로 입력해주세요" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};
    if (nickname !== undefined) updateData.nickname = nickname.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (image !== undefined && typeof image === "string") updateData.image = image;

    const updated = await prisma.user.update({
      where: { id: params.userId },
      data: updateData,
      select: { id: true, nickname: true, bio: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("프로필 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "프로필 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

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
