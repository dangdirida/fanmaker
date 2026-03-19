"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AILoadingState({ estimatedSeconds = 30 }: { estimatedSeconds?: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = Math.max(0, estimatedSeconds - elapsed);

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-[#000000] animate-spin" />
        <Loader2 className="w-6 h-6 text-black absolute inset-0 m-auto animate-pulse" />
      </div>
      <p className="text-white font-medium">AI가 창작 중이에요...</p>
      <p className="text-gray-500 text-sm">
        {remaining > 0 ? `약 ${remaining}초 남음` : "거의 완료됐어요!"}
      </p>
    </div>
  );
}
