import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/idol-game/save — 세이브 데이터 조회
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const saveData = await prisma.idolGameSave.findUnique({
    where: { userId: session.user.id },
  });

  if (saveData) {
    return NextResponse.json({
      success: true,
      data: { hasSave: true, save: saveData },
    });
  }

  return NextResponse.json({
    success: true,
    data: { hasSave: false },
  });
}

// POST /api/idol-game/save — 세이브 데이터 저장/업데이트
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
    const {
      groupName,
      groupType,
      concept,
      membersJson,
      statsJson,
      stage,
      week,
      energy,
      currentSceneId,
      flagsJson,
      choiceHistory,
      conceptBoardJson,
      playtimeMinutes,
    } = body;

    const fields = {
      groupName,
      groupType,
      concept,
      membersJson,
      statsJson,
      stage,
      week,
      energy,
      currentSceneId,
      flagsJson,
      choiceHistory,
      conceptBoardJson,
      playtimeMinutes,
    };

    const result = await prisma.idolGameSave.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...fields },
      update: { ...fields },
    });

    return NextResponse.json({
      success: true,
      data: { savedAt: result.updatedAt },
    });
  } catch (error) {
    console.error("[idol-game/save] POST error:", error);
    return NextResponse.json(
      { success: false, error: "저장에 실패했습니다" },
      { status: 500 }
    );
  }
}
