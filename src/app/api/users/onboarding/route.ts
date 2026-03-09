import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const { nickname, artistIds, activityType } = await req.json();

  // 닉네임 검증
  if (!nickname || nickname.length < 2 || nickname.length > 20) {
    return NextResponse.json(
      { success: false, error: "닉네임은 2~20자여야 합니다" },
      { status: 400 }
    );
  }

  // 활동 유형 검증
  if (!["LIGHT", "CREATIVE", "GLOBAL", "CREATOR"].includes(activityType)) {
    return NextResponse.json(
      { success: false, error: "유효하지 않은 활동 유형입니다" },
      { status: 400 }
    );
  }

  // 닉네임 중복 체크
  const existingNickname = await prisma.user.findUnique({
    where: { nickname },
    select: { id: true },
  });
  if (existingNickname && existingNickname.id !== session.user.id) {
    return NextResponse.json(
      { success: false, error: "이미 사용 중인 닉네임입니다" },
      { status: 409 }
    );
  }

  // 유저 업데이트
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nickname,
      activityType: activityType as ActivityType,
      onboardingDone: true,
    },
  });

  // 아티스트 팔로우
  if (artistIds && artistIds.length > 0) {
    const follows = artistIds.map((artistId: string) => ({
      userId: session.user.id,
      artistId,
    }));
    await prisma.artistFollow.createMany({
      data: follows,
      skipDuplicates: true,
    });
  }

  // 환영 이메일 발송 (비동기, 실패해도 무시)
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (user?.email) {
      sendWelcomeEmail(user.email, nickname);
    }
  } catch {
    console.error("환영 이메일 발송 실패");
  }

  return NextResponse.json({ success: true, data: { nickname, activityType } });
}
