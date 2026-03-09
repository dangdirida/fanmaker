import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증이 필요합니다" }, { status: 401 });
  }

  const { videoUrl, youtubeUrl } = await req.json();

  const job = await prisma.aIJob.create({
    data: {
      userId: session.user.id,
      type: "GLOBAL_TRANSCRIBE",
      status: "PROCESSING",
      inputData: { videoUrl, youtubeUrl },
    },
  });

  setTimeout(async () => {
    await prisma.aIJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        outputData: {
          subtitles: [
            { startTime: "00:00:01", endTime: "00:00:04", text: "안녕하세요 여러분" },
            { startTime: "00:00:05", endTime: "00:00:08", text: "오늘 새로운 영상을 준비했어요" },
          ],
        },
      },
    });
  }, 5000);

  return NextResponse.json({ success: true, data: { jobId: job.id } });
}
