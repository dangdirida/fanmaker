"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Check, RefreshCw } from "lucide-react";

interface VirtualStudioPopupProps {
  isOpen: boolean;
  memberIndex: number;
  memberName: string;
  memberGender: "female" | "male";
  onComplete: (imageUrl: string) => void;
  onClose: () => void;
}

export default function VirtualStudioPopup({
  isOpen,
  memberIndex: _memberIndex,
  memberName,
  memberGender,
  onComplete,
  onClose,
}: VirtualStudioPopupProps) {
  const [confirmImageUrl, setConfirmImageUrl] = useState<string | null>(null);

  // postMessage 리스너
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === "virtual-studio-complete" &&
        event.data.imageUrl
      ) {
        setConfirmImageUrl(event.data.imageUrl);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isOpen]);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setConfirmImageUrl(null);
    }
  }, [isOpen]);

  const handleUse = useCallback(() => {
    if (confirmImageUrl) {
      onComplete(confirmImageUrl);
    }
  }, [confirmImageUrl, onComplete]);

  const handleRetry = useCallback(() => {
    setConfirmImageUrl(null);
  }, []);

  if (!isOpen) return null;

  const iframeUrl = `/studio/virtual?gender=${memberGender}&embed=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {memberName}의 비주얼 만들기
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          {confirmImageUrl ? (
            // 확인 화면
            <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
              <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
                <img
                  src={confirmImageUrl}
                  alt={`${memberName} 비주얼`}
                  className="max-h-[40vh] w-auto object-contain"
                />
              </div>
              <p className="text-center text-white/70">
                이 이미지를 {memberName}의 모습으로 사용할까요?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleUse}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-purple-500 hover:to-pink-500"
                >
                  <Check size={16} />
                  사용하기
                </button>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/20"
                >
                  <RefreshCw size={16} />
                  다시 만들기
                </button>
              </div>
            </div>
          ) : (
            // 아이프레임
            <iframe
              src={iframeUrl}
              className="h-[65vh] w-full border-0"
              allow="camera; microphone"
              title={`${memberName} Virtual Studio`}
            />
          )}
        </div>

        {/* 푸터 - 확인 모드가 아닐 때만 표시 */}
        {!confirmImageUrl && (
          <div className="flex items-center justify-end border-t border-white/10 px-6 py-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/20 hover:text-white"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
