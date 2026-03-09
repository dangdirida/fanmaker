import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ReactionType } from "@prisma/client";

// POST /api/posts/[postId]/reactions — 반응 토글
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const { type } = await req.json();

  if (!["LIKE", "CHEER", "WOW"].includes(type)) {
    return NextResponse.json(
      { success: false, error: "유효하지 않은 반응 유형입니다" },
      { status: 400 }
    );
  }

  const existing = await prisma.reaction.findUnique({
    where: {
      postId_userId_type: {
        postId: params.postId,
        userId: session.user.id,
        type: type as ReactionType,
      },
    },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, data: { action: "removed" } });
  }

  await prisma.reaction.create({
    data: {
      postId: params.postId,
      userId: session.user.id,
      type: type as ReactionType,
    },
  });

  return NextResponse.json({ success: true, data: { action: "added" } });
}
