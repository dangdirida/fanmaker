import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증이 필요합니다" }, { status: 401 });
  }

  const { gender, skinTone, stylePreset, customPrompt } = await req.json();

  const job = await prisma.aIJob.create({
    data: {
      userId: session.user.id,
      type: "VIRTUAL_GENERATE",
      status: "PROCESSING",
      inputData: { gender, skinTone, stylePreset, customPrompt },
    },
  });

  // 데모용: 3초 후 완료 처리
  setTimeout(async () => {
    await prisma.aIJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        outputData: {
          imageUrl: "/api/placeholder/virtual-idol",
        },
      },
    });
  }, 3000);

  return NextResponse.json({ success: true, data: { jobId: job.id } });
}
