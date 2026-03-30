"use client";

import Link from "next/link";
import { Music2, Upload, Scissors, Sparkles, Bell } from "lucide-react";
import { useState } from "react";

const FEATURES = [
  { icon: Upload, title: "음원 업로드 & BPM 조정", desc: "좋아하는 곡을 업로드하고 BPM과 키를 자유롭게 조절하세요" },
  { icon: Scissors, title: "AI 파트 분리", desc: "보컬, 악기, 드럼을 AI가 자동으로 분리해드려요" },
  { icon: Sparkles, title: "AI 리믹스 스타일 생성", desc: "댄스팝, 로파이, EDM 등 6가지 스타일로 리믹스를 생성하세요" },
];

export default function RemixStudioPage() {
  const [notified, setNotified] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-5">
          <Music2 className="w-8 h-8 text-white" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          준비중
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">리믹스 스튜디오</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          좋아하는 아이돌 음원을 AI로 재탄생시켜 보세요. 곧 만나요!
        </p>
      </div>

      {/* 예고 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setNotified(true)}
          disabled={notified}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            notified
              ? "bg-[#00c389] text-white"
              : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
          }`}
        >
          <Bell className="w-4 h-4" />
          {notified ? "알림 등록 완료!" : "준비되면 알려주세요"}
        </button>
        <Link href="/feed" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          팬 유니버스로 돌아가기
        </Link>
      </div>
    </div>
  );
}
