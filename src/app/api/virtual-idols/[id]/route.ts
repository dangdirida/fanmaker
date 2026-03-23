import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { id } = await params;
  const idol = await prisma.virtualIdol.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!idol) {
    return NextResponse.json({ success: false, error: "찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: idol });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.virtualIdol.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ success: false, error: "찾을 수 없습니다" }, { status: 404 });
  }

  const allowedFields = [
    "name", "concept", "personality", "voiceType", "voiceDesc",
    "positions", "genres", "gender", "stylePreset", "hairColor",
    "hairLength", "skinTone", "eyeColor", "outfitStyle", "accessories",
    "baseModel", "thumbnailUrl", "vrmFileUrl", "isDraft", "step",
  ];

  const updateData: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) updateData[key] = body[key];
  }

  const idol = await prisma.virtualIdol.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, data: idol });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const existing = await prisma.virtualIdol.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, userId: true, postId: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "삭제할 수 없습니다" }, { status: 404 });
    }

    // 연결된 Post 먼저 삭제
    if (existing.postId) {
      await prisma.post.delete({ where: { id: existing.postId } }).catch(() => {});
    }

    await prisma.virtualIdol.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "삭제 실패" }, { status: 500 });
  }
}
