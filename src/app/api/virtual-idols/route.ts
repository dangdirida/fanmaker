import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
    }

    const idols = await prisma.virtualIdol.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: idols });
  } catch (error) {
    console.error("[GET /api/virtual-idols] Error:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const initialName = body.initialName || "새 버추얼 아이돌";

    const idol = await prisma.virtualIdol.create({
      data: {
        userId: session.user.id,
        name: initialName,
        isDraft: true,
        step: 1,
      },
    });

    return NextResponse.json({ success: true, data: idol });
  } catch (error) {
    console.error("[POST /api/virtual-idols] Error:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
