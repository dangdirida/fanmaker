"use client";

import { Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "기본 정보" },
  { num: 2, label: "외모 커스터마이즈" },
  { num: 3, label: "목소리 & 특성" },
  { num: 4, label: "완성 & 게시" },
];

interface Props {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export default function StepIndicator({ currentStep, completedSteps, onStepClick }: Props) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((s, i) => {
        const done = completedSteps.includes(s.num);
        const active = currentStep === s.num;
        const clickable = s.num <= Math.max(...completedSteps, currentStep);
        return (
          <div key={s.num} className="flex items-center gap-1 flex-1">
            <button
              onClick={() => clickable && onStepClick(s.num)}
              disabled={!clickable}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all w-full ${
                active
                  ? "bg-black text-white"
                  : done
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-gray-100 text-gray-400"
              } ${clickable && !active ? "cursor-pointer" : ""}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                done && !active ? "bg-green-500 text-white" : active ? "bg-white text-black" : "bg-gray-300 text-white"
              }`}>
                {done && !active ? <Check className="w-3 h-3" /> : s.num}
              </span>
              <span className="hidden sm:inline truncate">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-0.5 flex-shrink-0 ${done ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
