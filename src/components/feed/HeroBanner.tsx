"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

const slides = [
  {
    tag: " 버추얼 스튜디오",
    title: "나만의 버추얼\n아이돌을 직접 디자인하세요",
    sub: "AI로 세상에 없던 나만의 버추얼 아이돌을 만들어보세요",
    cta: "캐릭터 만들기 →",
    href: "/studio/virtual",
    icon: "",
    stats: ["8,500+ 캐릭터", "AI 얼굴 생성", "스타일 커스텀"],
    badges: ["AI 기반", "무료"],
  },
  {
    tag: " 컨셉 디자인",
    title: "다음 앨범 컨셉,\n내가 먼저 만든다",
    sub: "로고부터 앨범커버까지 컨셉 키트를 제작해보세요",
    cta: "컨셉 제작하기 →",
    href: "/studio/concept",
    icon: "",
    stats: ["5,200+ 컨셉", "앨범커버 포함", "무료 다운로드"],
    badges: ["AI 기반", "무료"],
  },
  {
    tag: " 퍼포먼스 기획",
    title: "무대 위 퍼포먼스를\n직접 기획",
    sub: "포메이션과 동선을 기획하고 AI 시뮬레이션으로 확인해보세요",
    cta: "퍼포먼스 기획 →",
    href: "/studio/performance",
    icon: "",
    stats: ["3,400+ 퍼포먼스", "3D 시뮬레이션", "팀 협업 가능"],
    badges: ["AI 기반", "무료"],
  },
  {
    tag: " 글로벌 싱크",
    title: "K-pop을\n전 세계 언어로",
    sub: "나만의 가상 아이돌 콘텐츠를 다국어로 번역·공유해요",
    cta: "번역 시작하기 →",
    href: "/studio/global-sync",
    icon: "",
    stats: ["45개 언어", "140개국 팬", "실시간 번역"],
    badges: ["AI 기반", "무료"],
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [_direction, setDirection] = useState<"left" | "right">("right");
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const goTo = useCallback(
    (index: number, dir?: "left" | "right") => {
      if (animating || index === current) return;
      setDirection(dir ?? (index > current ? "right" : "left"));
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setTimeout(() => setAnimating(false), 500);
      }, 10);
    },
    [current, animating]
  );

  const next = useCallback(() => {
    const nextIndex = (current + 1) % slides.length;
    setDirection("right");
    setAnimating(true);
    setTimeout(() => {
      setCurrent(nextIndex);
      setTimeout(() => setAnimating(false), 500);
    }, 10);
  }, [current]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <div
      className="relative w-full h-[300px] md:h-[460px] overflow-hidden"
      style={{ borderRadius: 20 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 배경: 순수 블랙 + radial gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/80 to-gray-900" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 75% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />
      {/* 좌측 오버레이 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 60%)",
        }}
      />

      {/* 배경 장식 원형 요소 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          right: -80,
          top: -80,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 280,
          height: 280,
          right: 60,
          bottom: -100,
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.03)",
        }}
      />

      {/* 콘텐츠 */}
      <div className="relative z-10 h-full flex items-center px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between w-full gap-8">
          {/* 왼쪽 텍스트 영역 */}
          <div
            key={current}
            className="flex-1 max-w-xl"
            style={{
              animation: "slideIn 500ms ease-in-out both",
            }}
          >
            {/* 태그 pill */}
            <div
              className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold text-white mb-5"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              {slide.tag}
            </div>

            {/* 메인 타이틀 */}
            <h2
              className="text-white whitespace-pre-line"
              style={{
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              {slide.title}
            </h2>

            {/* 서브 텍스트 */}
            <p
              className="mt-4 max-w-md"
              style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}
            >
              {slide.sub}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-5">
              {slide.stats.map((stat, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  <span
                    className="inline-block w-1 h-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.4)" }}
                  />
                  {stat}
                </span>
              ))}
            </div>

            {/* CTA 버튼 */}
            <Link
              href={slide.href}
              className="inline-flex items-center mt-7 bg-white text-black px-7 py-3 text-sm transition-all duration-200"
              style={{
                borderRadius: 12,
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 30px rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {slide.cta}
            </Link>
          </div>

          {/* 오른쪽 시각 요소 */}
          <div
            key={`visual-${current}`}
            className="hidden md:flex items-center justify-center relative"
            style={{
              width: 280,
              height: 280,
              flexShrink: 0,
              animation: "slideInRight 500ms ease-in-out both",
            }}
          >
            {/* 동심원 3개 */}
            <div
              className="absolute rounded-full"
              style={{
                width: 220,
                height: 220,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 160,
                height: 160,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 100,
                height: 100,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            />

            {/* 중앙 아이콘 */}
            <span className="relative z-10" style={{ fontSize: 52 }}>
              {slide.icon}
            </span>

            {/* 플로팅 배지: AI 기반 */}
            <div
              className="absolute text-white text-[11px] font-semibold px-3 py-1.5 rounded-full"
              style={{
                top: 20,
                right: -10,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                animation: "floatBadge 3s ease-in-out infinite",
              }}
            >
              {slide.badges[0]}
            </div>

            {/* 플로팅 배지: 무료 */}
            <div
              className="absolute text-white text-[11px] font-semibold px-3 py-1.5 rounded-full"
              style={{
                bottom: 30,
                left: -5,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                animation: "floatBadge 3s ease-in-out infinite 1.5s",
              }}
            >
              {slide.badges[1]}
            </div>
          </div>
        </div>
      </div>

      {/* 인디케이터 도트 */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              height: 6,
              width: i === current ? 24 : 6,
              backgroundColor:
                i === current
                  ? "rgba(255,255,255,1)"
                  : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* 애니메이션 키프레임 */}
      <style jsx>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes floatBadge {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
