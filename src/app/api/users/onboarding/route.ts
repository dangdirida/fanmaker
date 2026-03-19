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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "잘못된 요청 형식입니다" },
      { status: 400 }
    );
  }

  const { nickname, artistIds, activityType } = body;

  // 닉네임 검증
  if (!nickname || typeof nickname !== "string" || nickname.length < 2 || nickname.length > 20) {
    return NextResponse.json(
      { success: false, error: "닉네임은 2~20자여야 합니다" },
      { status: 400 }
    );
  }

  // 활동 유형 검증 (대문자만 허용)
  const validTypes = ["LIGHT", "CREATIVE", "GLOBAL", "CREATOR"];
  if (!activityType || !validTypes.includes(activityType)) {
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

  // 아티스트 팔로우 (존재하지 않는 ID는 무시)
  if (Array.isArray(artistIds) && artistIds.length > 0) {
    try {
      const validArtists = await prisma.artist.findMany({
        where: { id: { in: artistIds.filter((id: any) => typeof id === "string") } },
        select: { id: true },
      });
      if (validArtists.length > 0) {
        await prisma.artistFollow.createMany({
          data: validArtists.map((a) => ({
            userId: session.user.id,
            artistId: a.id,
          })),
          skipDuplicates: true,
        });
      }
    } catch (e) {
      console.error("[onboarding] artistFollow error:", e);
    }
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
