"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Crown, Sparkles, ChevronDown, ChevronUp, Zap } from "lucide-react";

const freePlan = {
  name: "Free",
  price: "무료",
  description: "K-pop 팬 창작을 시작해보세요",
  features: [
    "일 3회 AI 생성",
    "기본 스튜디오 접근",
    "커뮤니티 참여",
  ],
  cta: "현재 플랜",
  disabled: true,
};

const proPlan = {
  name: "Pro",
  price: "9,900",
  description: "무제한 창작의 자유를 누리세요",
  features: [
    "무제한 AI 생성",
    "프리미엄 스튜디오",
    "고화질 내보내기 (4K)",
    "우선 처리",
    "광고 제거",
    "Pro 배지",
  ],
  cta: "Pro 시작하기",
  disabled: false,
};

const faqs = [
  {
    q: "Pro 플랜은 언제든 해지할 수 있나요?",
    a: "네, 언제든 해지 가능합니다. 해지 후에도 결제 기간이 끝날 때까지 Pro 기능을 이용할 수 있습니다.",
  },
  {
    q: "결제 수단은 어떤 것이 가능한가요?",
    a: "신용카드, 체크카드를 지원하며, Stripe를 통해 안전하게 결제됩니다.",
  },
  {
    q: "무료 플랜에서 Pro로 업그레이드하면 기존 작업물은 어떻게 되나요?",
    a: "기존에 생성한 모든 작업물은 그대로 유지됩니다. Pro 업그레이드 후 고화질 내보내기 등 추가 기능을 바로 사용할 수 있습니다.",
  },
  {
    q: "Pro 배지는 어디에 표시되나요?",
    a: "프로필, 게시물, 댓글 등 커뮤니티 내 모든 활동에서 닉네임 옆에 Pro 배지가 표시됩니다.",
  },
  {
    q: "환불 정책은 어떻게 되나요?",
    a: "결제 후 7일 이내에 요청하시면 전액 환불이 가능합니다. 고객센터로 문의해 주세요.",
  },
];

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST" });
      const json = await res.json();

      if (json.success && json.data?.url) {
        router.push(json.data.url);
      } else {
        alert(json.error || "결제 세션 생성에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-12 md:py-20">
      {/* 데모 상태 안내 */}
      {status === "demo" && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-[#c084fc]/10 border border-[#c084fc]/30 rounded-xl text-center">
          <p className="text-[#c084fc] text-sm">
            현재 데모 모드입니다. Stripe 연동 후 실제 결제가 가능합니다.
          </p>
        </div>
      )}

      {/* 헤더 */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff3d7f]/10 border border-[#ff3d7f]/20 rounded-full mb-6">
          <Crown className="w-4 h-4 text-[#ff3d7f]" />
          <span className="text-sm text-[#ff3d7f] font-medium">PRO 플랜</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          창작의 한계를{" "}
          <span className="bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] bg-clip-text text-transparent">
            없애세요
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-lg mx-auto">
          Pro로 업그레이드하고 무제한 AI 생성, 고화질 내보내기 등 프리미엄 기능을 경험하세요.
        </p>
      </div>

      {/* 플랜 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20">
        {/* Free 플랜 */}
        <div className="relative rounded-2xl border border-gray-800 bg-[#111] p-8 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-1">{freePlan.name}</h3>
          <p className="text-gray-500 text-sm mb-6">{freePlan.description}</p>

          <div className="mb-8">
            <span className="text-4xl font-bold text-white">{freePlan.price}</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {freePlan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-gray-600 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-medium bg-gray-800 text-gray-500 cursor-not-allowed"
          >
            {freePlan.cta}
          </button>
        </div>

        {/* Pro 플랜 */}
        <div className="relative rounded-2xl border border-[#ff3d7f]/40 bg-[#111] p-8 flex flex-col overflow-hidden">
          {/* 그라데이션 글로우 */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ff3d7f]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#c084fc]/20 rounded-full blur-3xl pointer-events-none" />

          {/* 인기 뱃지 */}
          <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] rounded-full">
            <span className="text-xs font-bold text-white">POPULAR</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            {proPlan.name}
            <Sparkles className="w-5 h-5 text-[#ff3d7f]" />
          </h3>
          <p className="text-gray-500 text-sm mb-6">{proPlan.description}</p>

          <div className="mb-8">
            <span className="text-4xl font-bold bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] bg-clip-text text-transparent">
              {proPlan.price}
            </span>
            <span className="text-gray-400 text-sm ml-1">원 / 월</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {proPlan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-gray-200 text-sm">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="relative w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#ff3d7f] to-[#c084fc] text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                {proPlan.cta}
              </>
            )}
          </button>
        </div>
      </div>

      {/* FAQ 섹션 */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          자주 묻는 질문
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-800 rounded-xl bg-[#111] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm text-gray-200 font-medium pr-4">
                  {faq.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <PricingContent />
    </Suspense>
  );
}
