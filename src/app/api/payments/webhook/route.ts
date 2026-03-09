import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// POST /api/payments/webhook — Stripe webhook 핸들러
export async function POST(req: NextRequest) {
  // TODO: Stripe webhook 연동 시 구현
  // 1. Stripe signature 검증
  // 2. event.type에 따라 처리:
  //    - checkout.session.completed → user.isPro = true
  //    - customer.subscription.deleted → user.isPro = false
  //    - invoice.payment_failed → 알림 발송

  try {
    await req.text();

    // const sig = req.headers.get("stripe-signature");
    // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    // switch (event.type) {
    //   case "checkout.session.completed": {
    //     const session = event.data.object;
    //     const userId = session.metadata?.userId;
    //     if (userId) {
    //       await prisma.user.update({
    //         where: { id: userId },
    //         data: { isPro: true },
    //       });
    //     }
    //     break;
    //   }
    //   case "customer.subscription.deleted": {
    //     // Pro 해지 처리
    //     break;
    //   }
    // }

    return NextResponse.json({ success: true, data: { received: true } });
  } catch (error) {
    console.error("[payments/webhook] Error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook 처리 실패" },
      { status: 400 }
    );
  }
}
