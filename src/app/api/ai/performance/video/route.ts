import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증이 필요합니다" }, { status: 401 });
  }

  const { scenes, artistName } = await req.json();

  const job = await prisma.aIJob.create({
    data: {
      userId: session.user.id,
      type: "PERFORMANCE_VIDEO",
      status: "PROCESSING",
      inputData: { scenes, artistName },
    },
  });

  // 데모: 5초 후 완료
  setTimeout(async () => {
    await prisma.aIJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        outputData: { videoUrl: "demo-video.mp4" },
      },
    });
  }, 5000);

  return NextResponse.json({ success: true, data: { jobId: job.id } });
}
