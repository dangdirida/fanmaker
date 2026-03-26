import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 다음 KST 자정 (UTC 기준 15:00) 계산
function getNextKstMidnight(): Date {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000; // UTC+9
  const kstNow = new Date(now.getTime() + kstOffset);

  // KST 기준 내일 00:00
  const nextMidnightKst = new Date(kstNow);
  nextMidnightKst.setDate(nextMidnightKst.getDate() + 1);
  nextMidnightKst.setHours(0, 0, 0, 0);

  // UTC로 변환 (KST - 9시간 = UTC)
  return new Date(nextMidnightKst.getTime() - kstOffset);
}

// 에너지 리셋이 필요한지 확인하고, 필요하면 리셋 후 업데이트
async function checkAndResetEnergy(
  saveId: string,
  energyResetAt: Date | null,
  isPro: boolean
): Promise<{ energy: number; energyResetAt: Date }> {
  const maxEnergy = isPro ? 10 : 5;
  const now = new Date();

  if (!energyResetAt || energyResetAt <= now) {
    const nextReset = getNextKstMidnight();
    await prisma.idolGameSave.update({
      where: { id: saveId },
      data: { energy: maxEnergy, energyResetAt: nextReset },
    });
    return { energy: maxEnergy, energyResetAt: nextReset };
  }

  return { energy: -1, energyResetAt }; // -1 = 리셋 불필요
}

// GET /api/idol-game/energy — 에너지 조회
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });
  const isPro = user?.isPro ?? false;
  const maxEnergy = isPro ? 10 : 5;

  const save = await prisma.idolGameSave.findUnique({
    where: { userId: session.user.id },
  });

  if (!save) {
    return NextResponse.json({
      success: true,
      data: { current: 0, max: maxEnergy, resetAt: null },
    });
  }

  const resetResult = await checkAndResetEnergy(
    save.id,
    save.energyResetAt,
    isPro
  );

  const current = resetResult.energy === -1 ? save.energy : resetResult.energy;
  const resetAt = resetResult.energyResetAt;

  return NextResponse.json({
    success: true,
    data: { current, max: maxEnergy, resetAt },
  });
}

// POST /api/idol-game/energy — 에너지 소모
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { amount } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true },
    });
    const isPro = user?.isPro ?? false;

    const save = await prisma.idolGameSave.findUnique({
      where: { userId: session.user.id },
    });

    if (!save) {
      return NextResponse.json(
        { success: false, error: "세이브 데이터가 없습니다" },
        { status: 404 }
      );
    }

    // 에너지 리셋 확인
    const resetResult = await checkAndResetEnergy(
      save.id,
      save.energyResetAt,
      isPro
    );
    const currentEnergy =
      resetResult.energy === -1 ? save.energy : resetResult.energy;
    const currentResetAt = resetResult.energyResetAt;

    if (currentEnergy < amount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ENERGY_EMPTY",
            message:
              "오늘 에너지를 모두 사용했어요. 내일 다시 돌아오면 에너지가 충전돼요.",
            resetAt: currentResetAt,
          },
        },
        { status: 409 }
      );
    }

    const newEnergy = currentEnergy - amount;
    await prisma.idolGameSave.update({
      where: { userId: session.user.id },
      data: { energy: newEnergy },
    });

    return NextResponse.json({
      success: true,
      data: { remaining: newEnergy },
    });
  } catch (error) {
    console.error("[idol-game/energy] POST error:", error);
    return NextResponse.json(
      { success: false, error: "에너지 처리에 실패했습니다" },
      { status: 500 }
    );
  }
}
