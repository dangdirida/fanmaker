import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증이 필요합니다" }, { status: 401 });
  }

  const { artistName, mood, keywords, primaryColor } = await req.json();

  // AIJob 생성
  const job = await prisma.aIJob.create({
    data: {
      userId: session.user.id,
      type: "CONCEPT_LOGO",
      status: "PROCESSING",
      inputData: { artistName, mood, keywords, primaryColor },
    },
  });

  // 실제 AI 호출은 Replicate API 연동 시 구현
  // 데모용: 3초 후 완료 처리
  setTimeout(async () => {
    await prisma.aIJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        outputData: {
          logos: [
            "/api/placeholder/logo1",
            "/api/placeholder/logo2",
            "/api/placeholder/logo3",
            "/api/placeholder/logo4",
            "/api/placeholder/logo5",
          ],
          albumCover: "/api/placeholder/album-cover",
          keyVisual: "/api/placeholder/key-visual",
          palette: [primaryColor || "#ff3d7f", "#c084fc", "#38bdf8", "#0a0a0a", "#ffffff"],
        },
      },
    });
  }, 3000);

  return NextResponse.json({ success: true, data: { jobId: job.id } });
}
