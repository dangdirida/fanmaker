import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증이 필요합니다" }, { status: 401 });
  }

  const job = await prisma.aIJob.findUnique({
    where: { id: params.jobId },
    select: { id: true, status: true, outputData: true, error: true, type: true },
  });

  if (!job) {
    return NextResponse.json({ success: false, error: "작업을 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: job });
}
