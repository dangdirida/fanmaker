import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/payments/checkout — Stripe 결제 세션 생성
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true },
    });

    if (user?.isPro) {
      return NextResponse.json(
        { success: false, error: "이미 Pro 플랜을 이용 중입니다." },
        { status: 400 }
      );
    }

    // TODO: Stripe 연동 시 실제 checkout session 생성
    // const stripeSession = await stripe.checkout.sessions.create({
    //   mode: "subscription",
    //   customer_email: session.user.email,
    //   line_items: [{ price: "price_XXXXX", quantity: 1 }],
    //   success_url: `${process.env.NEXTAUTH_URL}/pricing?status=success`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/pricing?status=cancel`,
    //   metadata: { userId: session.user.id },
    // });
    // return NextResponse.json({ success: true, data: { url: stripeSession.url } });

    return NextResponse.json({
      success: true,
      data: { url: "/pricing?status=demo" },
    });
  } catch (error) {
    console.error("[payments/checkout] Error:", error);
    return NextResponse.json(
      { success: false, error: "결제 세션 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
