"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Download, SkipForward, Play, X } from "lucide-react";

interface CameraDanceModalProps {
  isOpen: boolean;
  effect: {
    vocal?: number;
    dance?: number;
    charm?: number;
    mental?: number;
  };
  onComplete: (fullBonus: boolean) => void;
  onClose: () => void;
  members: Array<{ gender: "female" | "male"; customImageUrl?: string }>;
}

type Phase = "idle" | "countdown" | "done";

export default function CameraDanceModal({
  isOpen,
  effect,
  onComplete,
  onClose,
  members,
}: CameraDanceModalProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(5);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [saveRecording, setSaveRecording] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 카메라 초기화
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
      setCameraError(false);
    } catch {
      setCameraError(true);
      setCameraReady(false);
    }
  }, []);

  // 스트림 정리
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // 모달 열릴 때 카메라 시작
  useEffect(() => {
    if (isOpen) {
      setPhase("idle");
      setCountdown(5);
      setCameraReady(false);
      setCameraError(false);
      setDownloadUrl(null);
      chunksRef.current = [];
      initCamera();
    }
    return () => {
      cleanupStream();
    };
  }, [isOpen, initCamera, cleanupStream]);

  // 카운트다운 시작
  const handleStart = useCallback(() => {
    setPhase("countdown");
    setCountdown(5);

    // 오디오 재생 시도
    try {
      const audio = new Audio("/sounds/dance_eval_loop.mp3");
      audio.loop = true;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch {
      // 오디오 없어도 진행
    }

    // 녹화 시작
    if (saveRecording && streamRef.current) {
      try {
        const recorder = new MediaRecorder(streamRef.current);
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
          }
        };
        recorder.start();
        recorderRef.current = recorder;
      } catch {
        // 녹화 실패해도 진행
      }
    }

    let count = 5;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        // 녹화 중지
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
        // 오디오 중지
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setPhase("done");
        setCountdown(0);
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [saveRecording]);

  // 완료 처리
  const handleFinish = useCallback(() => {
    cleanupStream();
    onComplete(true);
  }, [cleanupStream, onComplete]);

  // 건너뛰기
  const handleSkip = useCallback(() => {
    cleanupStream();
    onComplete(false);
  }, [cleanupStream, onComplete]);

  // 닫기
  const handleClose = useCallback(() => {
    cleanupStream();
    onClose();
  }, [cleanupStream, onClose]);

  if (!isOpen) return null;

  // 멤버 색상
  const memberColors = [
    "bg-pink-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-red-500",
    "bg-indigo-500",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative flex h-full w-full max-w-2xl flex-col items-center px-4 py-8">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X size={24} />
        </button>

        {/* 헤더 */}
        <h2 className="mb-2 text-2xl font-bold text-white">직접 춤춰보기</h2>
        <p className="mb-6 text-center text-sm text-white/60">
          카메라 앞에서 직접 춰보세요. 참여만 해도 댄스 스탯 보너스!
        </p>

        {/* 효과 표시 */}
        <div className="mb-4 flex gap-3 text-xs text-white/50">
          {effect.vocal != null && effect.vocal !== 0 && (
            <span className="text-blue-400">Vocal +{effect.vocal}</span>
          )}
          {effect.dance != null && effect.dance !== 0 && (
            <span className="text-pink-400">Dance +{effect.dance}</span>
          )}
          {effect.charm != null && effect.charm !== 0 && (
            <span className="text-orange-400">Charm +{effect.charm}</span>
          )}
          {effect.mental != null && effect.mental !== 0 && (
            <span className="text-green-400">Mental +{effect.mental}</span>
          )}
        </div>

        {/* 카메라 영역 */}
        <div className="relative mb-6 flex aspect-video w-full max-w-md items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black">
          {cameraError ? (
            <div className="flex flex-col items-center gap-3 text-white/40">
              <CameraOff size={48} />
              <p className="text-sm">카메라를 사용할 수 없습니다</p>
              {phase === "idle" && (
                <button
                  onClick={handleStart}
                  className="mt-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500"
                >
                  카메라 없이 참여하기
                </button>
              )}
            </div>
          ) : cameraReady ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/40">
              <Camera size={48} className="animate-pulse" />
              <p className="text-sm">카메라 연결 중...</p>
            </div>
          )}

          {/* 카운트다운 오버레이 */}
          {phase === "countdown" && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="animate-pulse text-8xl font-black text-white drop-shadow-lg">
                {countdown}
              </span>
            </div>
          )}

          {/* 완료 오버레이 */}
          {phase === "done" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-2xl font-bold text-green-400">
                완료!
              </span>
            </div>
          )}
        </div>

        {/* 춤추는 멤버들 */}
        {phase === "countdown" && (
          <div className="mb-4 flex items-end gap-3">
            {members.map((member, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`h-10 w-10 animate-bounce rounded-full ${memberColors[i % memberColors.length]} border-2 border-white/30 shadow-lg`}
                  style={{
                    animationDelay: `${i * 120}ms`,
                    animationDuration: "0.5s",
                  }}
                >
                  {member.customImageUrl && (
                    <img
                      src={member.customImageUrl}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  )}
                </div>
                <span className="text-[10px] text-white/40">
                  {member.gender === "female" ? "F" : "M"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 녹화 체크박스 */}
        {phase === "idle" && !cameraError && cameraReady && (
          <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-white/60 transition hover:text-white/80">
            <input
              type="checkbox"
              checked={saveRecording}
              onChange={(e) => setSaveRecording(e.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-transparent accent-purple-500"
            />
            이 순간 저장하기
          </label>
        )}

        {/* 버튼 영역 */}
        <div className="mt-auto flex w-full max-w-md flex-col items-center gap-3">
          {phase === "idle" && !cameraError && cameraReady && (
            <button
              onClick={handleStart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-500"
            >
              <Play size={20} />
              시작
            </button>
          )}

          {phase === "done" && (
            <div className="flex w-full flex-col items-center gap-3">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download="dance_recording.webm"
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/20"
                >
                  <Download size={16} />
                  녹화 영상 다운로드
                </a>
              )}
              <button
                onClick={handleFinish}
                className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-lg font-bold text-white transition hover:from-green-500 hover:to-emerald-500"
              >
                완료 (100% 보너스 적용)
              </button>
            </div>
          )}

          {/* 건너뛰기 */}
          {phase !== "done" && (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 text-sm text-white/40 transition hover:text-white/70"
            >
              <SkipForward size={14} />
              건너뛰기 (50% 효과)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
