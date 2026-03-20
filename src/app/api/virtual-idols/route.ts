import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const idols = await prisma.virtualIdol.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: idols });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const idol = await prisma.virtualIdol.create({
    data: {
      userId: session.user.id,
      name: "새 버추얼 아이돌",
      isDraft: true,
      step: 1,
    },
  });

  return NextResponse.json({ success: true, data: idol });
}
