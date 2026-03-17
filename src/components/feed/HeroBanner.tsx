"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "내가 직접 만드는\nK-pop 리믹스",
    sub: "좋아하는 아이돌 음원을 AI로 재탄생시켜 보세요",
    cta: "리믹스 시작하기",
    href: "/studio/remix",
    gradient: "from-[#7c3aed] via-[#a855f7] to-[#ec4899]",
    mockEmoji: "🎵",
    mockLabel: "AI 리믹스 생성 중...",
    mockBars: true,
  },
  {
    title: "나만의 버추얼\n아이돌 디자인",
    sub: "AI로 버추얼 아이돌의 비주얼을 직접 만들어보세요",
    cta: "캐릭터 만들기",
    href: "/studio/virtual",
    gradient: "from-[#ec4899] via-[#f43f5e] to-[#a855f7]",
    mockEmoji: "🎭",
    mockLabel: "버추얼 프리뷰",
    mockBars: false,
  },
  {
    title: "다음 앨범 컨셉,\n팬이 먼저 만든다",
    sub: "로고부터 앨범커버까지 컨셉 키트를 AI로 제작하세요",
    cta: "컨셉 디자인 시작",
    href: "/studio/concept",
    gradient: "from-[#0ea5e9] via-[#3b82f6] to-[#6366f1]",
    mockEmoji: "🎨",
    mockLabel: "컨셉 키트 미리보기",
    mockBars: false,
  },
  {
    title: "무대 퍼포먼스를\n직접 기획하세요",
    sub: "포메이션과 동선을 기획하고 AI 시뮬레이션으로 확인",
    cta: "퍼포먼스 기획",
    href: "/studio/performance",
    gradient: "from-[#f97316] via-[#ef4444] to-[#dc2626]",
    mockEmoji: "💃",
    mockLabel: "포메이션 에디터",
    mockBars: false,
  },
  {
    title: "새로운 아이돌\n그룹을 창조하세요",
    sub: "세계관부터 멤버 구성까지 AI와 함께 데뷔 기획서 완성",
    cta: "아이돌 기획 시작",
    href: "/studio/idol-project",
    gradient: "from-[#10b981] via-[#14b8a6] to-[#3b82f6]",
    mockEmoji: "⭐",
    mockLabel: "AI 기획서 생성",
    mockBars: false,
  },
  {
    title: "K-pop을\n전 세계 언어로",
    sub: "좋아하는 아티스트의 콘텐츠를 다국어로 번역하고 공유하세요",
    cta: "번역 시작하기",
    href: "/studio/global-sync",
    gradient: "from-[#eab308] via-[#f97316] to-[#ef4444]",
    mockEmoji: "🌍",
    mockLabel: "자막 번역 미리보기",
    mockBars: false,
  },
];

function FloatingParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <div
      className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
      style={{
        left: `${x}%`,
        bottom: "-5%",
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 4}s`,
      }}
    />
  );
}

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const goTo = useCallback(
    (index: number) => {
      setTextVisible(false);
      setTimeout(() => {
        setCurrent(index);
        setTextVisible(true);
      }, 200);
    },
    []
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 3000);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <div
      className="relative w-full h-[260px] md:h-[440px] overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 배경 그라디언트 */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-br ${s.gradient} transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* 파티클 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <FloatingParticle key={i} delay={i * 0.5} x={8 + i * 7.5} />
      ))}

      {/* 장식 오브 */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

      {/* 콘텐츠 */}
      <div className="relative z-10 h-full flex items-center px-6 md:px-12">
        <div className="flex items-center justify-between w-full gap-6">
          {/* 텍스트 영역 */}
          <div
            className={`flex-1 max-w-lg transition-all duration-500 ${
              textVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight whitespace-pre-line drop-shadow-lg">
              {slide.title}
            </h2>
            <p className="text-sm md:text-lg text-white/80 mt-3 md:mt-4 max-w-md">
              {slide.sub}
            </p>
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 mt-5 md:mt-7 bg-white text-gray-900 px-6 md:px-8 py-2.5 md:py-3.5 rounded-full font-bold text-sm md:text-base hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
            >
              {slide.cta}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 목업 카드 */}
          <div
            className={`hidden md:flex flex-col items-center transition-all duration-500 ${
              textVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <div className="w-56 lg:w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl">
              <div className="text-center mb-4">
                <span className="text-5xl">{slide.mockEmoji}</span>
              </div>
              <p className="text-white/90 text-sm font-medium text-center mb-4">
                {slide.mockLabel}
              </p>
              {slide.mockBars ? (
                <div className="flex items-end justify-center gap-1 h-12">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-white/40 rounded-full animate-pulse"
                      style={{
                        height: `${20 + Math.sin(i * 0.8) * 30 + Math.random() * 20}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-2 bg-white/20 rounded-full w-full" />
                  <div className="h-2 bg-white/20 rounded-full w-3/4" />
                  <div className="h-2 bg-white/20 rounded-full w-5/6" />
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <div className="px-4 py-1.5 bg-white/20 rounded-full text-white text-xs font-medium">
                  미리보기
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 좌/우 화살표 */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* 인디케이터 도트 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 bg-white"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* 플로팅 애니메이션 CSS */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-400px) scale(0.5);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
