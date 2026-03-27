import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, artistId } = await req.json();

    const idol = await prisma.virtualIdol.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!idol) {
      return NextResponse.json({ success: false, error: "찾을 수 없습니다" }, { status: 404 });
    }

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        artistId: artistId || null,
        category: "VIRTUAL",
        title: title || `${idol.name}의 버추얼 아이돌`,
        description: description || idol.personality || null,
        thumbnailUrl: idol.thumbnailUrl,
        contentData: {
          virtualIdolId: idol.id,
          gender: idol.gender,
          stylePreset: idol.stylePreset,
          voiceType: idol.voiceType,
          positions: idol.positions,
          hairColor: idol.hairColor,
          skinTone: idol.skinTone,
          eyeColor: idol.eyeColor,
          outfitStyle: idol.outfitStyle,
        },
        fileUrls: idol.vrmFileUrl ? [idol.vrmFileUrl] : [],
        tags: ["버추얼아이돌", idol.stylePreset, ...(idol.positions || []).slice(0, 2)],
      },
    });

    await prisma.virtualIdol.update({
      where: { id },
      data: { isDraft: false, postId: post.id },
    });

    return NextResponse.json({ success: true, data: { postId: post.id } });
  } catch (error) {
    console.error("[POST /api/virtual-idols/[id]/publish] Error:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
