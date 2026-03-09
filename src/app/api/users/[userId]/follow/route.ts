import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const followerId = session.user.id;
    const followingId = params.userId;

    // 자기 자신을 팔로우할 수 없음
    if (followerId === followingId) {
      return NextResponse.json(
        { success: false, error: "자기 자신을 팔로우할 수 없습니다" },
        { status: 400 }
      );
    }

    // 대상 사용자 존재 확인
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 팔로우 토글
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existing) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });
      return NextResponse.json({
        success: true,
        data: { following: false },
      });
    }

    await prisma.follow.create({
      data: { followerId, followingId },
    });

    return NextResponse.json({
      success: true,
      data: { following: true },
    });
  } catch (error) {
    console.error("팔로우 토글 오류:", error);
    return NextResponse.json(
      { success: false, error: "팔로우 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
