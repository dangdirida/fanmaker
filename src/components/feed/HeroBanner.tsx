"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Music, ImageIcon, Palette, Activity, Users, Globe } from "lucide-react";

const slides = [
  {
    title: "내가 직접 만드는 K-pop 리믹스",
    description: "좋아하는 아이돌 음원을 AI로 재탄생시켜 보세요",
    button: "리믹스 시작",
    href: "/studio/remix",
    gradient: "from-[#1a0533] via-[#2d1b69] to-[#0a0a0a]",
    icon: Music,
    iconColor: "text-purple-400",
  },
  {
    title: "나만의 버추얼 아이돌 디자인",
    description: "AI로 버추얼 아이돌의 비주얼을 직접 만들어보세요",
    button: "캐릭터 만들기",
    href: "/studio/virtual",
    gradient: "from-[#33061a] via-[#4a1942] to-[#0a0a0a]",
    icon: ImageIcon,
    iconColor: "text-pink-400",
  },
  {
    title: "다음 앨범 컨셉, 팬이 먼저 만든다",
    description: "로고부터 앨범커버까지 컨셉 키트를 제작해보세요",
    button: "컨셉 제작",
    href: "/studio/concept",
    gradient: "from-[#061a33] via-[#0c3366] to-[#0a0a0a]",
    icon: Palette,
    iconColor: "text-cyan-400",
  },
  {
    title: "무대 위 퍼포먼스를 직접 기획",
    description: "포메이션과 동선을 기획하고 AI 시뮬레이션으로 확인해보세요",
    button: "퍼포먼스 기획",
    href: "/studio/performance",
    gradient: "from-[#331006] via-[#662200] to-[#0a0a0a]",
    icon: Activity,
    iconColor: "text-orange-400",
  },
  {
    title: "새로운 아이돌 그룹을 창조해보세요",
    description: "세계관부터 멤버 구성까지, AI와 함께 데뷔 기획서를 완성해요",
    button: "아이돌 기획",
    href: "/studio/idol-project",
    gradient: "from-[#061a0c] via-[#0c4d26] to-[#0a0a0a]",
    icon: Users,
    iconColor: "text-green-400",
  },
  {
    title: "K-pop을 전 세계 언어로",
    description: "내가 좋아하는 아티스트의 콘텐츠를 다국어로 번역·공유해요",
    button: "번역 시작",
    href: "/studio/global-sync",
    gradient: "from-[#332b06] via-[#664d00] to-[#0a0a0a]",
    icon: Globe,
    iconColor: "text-amber-400",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // 3초 자동 전환
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full h-[240px] md:h-[420px] overflow-hidden rounded-2xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 배경 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700`}
      />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <div
          className={`mb-4 md:mb-6 ${slide.iconColor}`}
        >
          <Icon className="w-10 h-10 md:w-14 md:h-14 opacity-80" />
        </div>
        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 transition-all duration-500">
          {slide.title}
        </h2>
        <p className="text-sm md:text-base text-gray-300 mb-4 md:mb-6 max-w-md transition-all duration-500">
          {slide.description}
        </p>
        <Link
          href={slide.href}
          className="inline-flex items-center gap-2 bg-[#ff3d7f] hover:bg-[#e6356f] text-white font-medium text-sm md:text-base px-5 md:px-7 py-2.5 md:py-3 rounded-xl transition-colors"
        >
          {slide.button}
        </Link>
      </div>

      {/* 좌/우 화살표 */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {/* 인디케이터 도트 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-[#ff3d7f]"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
