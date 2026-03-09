import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { artistId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const existing = await prisma.artistFollow.findUnique({
    where: {
      userId_artistId: { userId: session.user.id, artistId: params.artistId },
    },
  });

  if (existing) {
    await prisma.artistFollow.delete({
      where: {
        userId_artistId: { userId: session.user.id, artistId: params.artistId },
      },
    });
    return NextResponse.json({ success: true, data: { action: "unfollowed" } });
  }

  await prisma.artistFollow.create({
    data: { userId: session.user.id, artistId: params.artistId },
  });

  return NextResponse.json({ success: true, data: { action: "followed" } });
}
