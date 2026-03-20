"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, ExternalLink, Loader2, Download } from "lucide-react";

type SampleAvatar = {
  name: string;
  thumbnail?: string;
  vrm_url?: string;
  license?: string;
};

interface VRMCustomizerProps {
  onVRMLoad: (file: File, url: string) => void;
}

export default function VRMCustomizer({ onVRMLoad }: VRMCustomizerProps) {
  const [subTab, setSubTab] = useState<"studio" | "samples" | "upload">("samples");
  const [samples, setSamples] = useState<SampleAvatar[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CharacterStudio postMessage 수신
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "vrm-export" && e.data.blob) {
        const file = new File([e.data.blob], "character.vrm", {
          type: "application/octet-stream",
        });
        const url = URL.createObjectURL(file);
        onVRMLoad(file, url);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onVRMLoad]);

  // 샘플 아바타 로드
  useEffect(() => {
    if (subTab === "samples" && samples.length === 0) {
      setLoadingSamples(true);
      fetch(
        "https://raw.githubusercontent.com/ToxSam/open-source-avatars/main/data/projects.json"
      )
        .then((res) => res.json())
        .then((data) => {
          const avatars = (Array.isArray(data) ? data : data.projects || [])
            .filter(
              (p: SampleAvatar) => p.vrm_url && p.vrm_url.endsWith(".vrm")
            )
            .slice(0, 12);
          setSamples(avatars);
        })
        .catch(() => setSamples([]))
        .finally(() => setLoadingSamples(false));
    }
  }, [subTab, samples.length]);

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".vrm")) return;
    const url = URL.createObjectURL(file);
    onVRMLoad(file, url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSampleSelect = async (avatar: SampleAvatar) => {
    if (!avatar.vrm_url) return;
    try {
      const res = await fetch(avatar.vrm_url);
      const blob = await res.blob();
      const file = new File([blob], `${avatar.name || "sample"}.vrm`, {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(file);
      onVRMLoad(file, url);
    } catch {
      alert("VRM 파일을 불러올 수 없습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 서브탭 */}
      <div className="flex gap-2">
        {[
          { key: "samples" as const, label: "샘플에서 선택" },
          { key: "studio" as const, label: "직접 만들기" },
          { key: "upload" as const, label: "파일 업로드" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              subTab === t.key
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 샘플 갤러리 */}
      {subTab === "samples" && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            CC0/MIT 라이선스 무료 VRM 아바타를 선택하세요
          </p>
          {loadingSamples ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : samples.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {samples.map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => handleSampleSelect(avatar)}
                  className="group bg-gray-50 border border-gray-200 rounded-2xl p-3 hover:border-black hover:shadow-lg transition-all text-left"
                >
                  <div className="aspect-square bg-gray-100 rounded-xl mb-2 overflow-hidden flex items-center justify-center">
                    {avatar.thumbnail ? (
                      <Image
                        src={avatar.thumbnail}
                        alt={avatar.name || "Avatar"}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-4xl text-gray-300">&#x1F9D1;</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {avatar.name || `Avatar ${i + 1}`}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Download className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
                    <span className="text-[10px] text-gray-400 group-hover:text-black transition-colors">
                      VRM
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 text-sm">
              <p>샘플 목록을 불러올 수 없습니다.</p>
              <p className="mt-1">직접 VRM 파일을 업로드해주세요.</p>
            </div>
          )}
        </div>
      )}

      {/* CharacterStudio iframe */}
      {subTab === "studio" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ExternalLink className="w-4 h-4" />
            <span>
              CharacterStudio에서 캐릭터를 만든 후 Export하면 자동으로
              로드됩니다
            </span>
          </div>
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <iframe
              src="https://characterstudio.dev"
              className="w-full"
              style={{ height: "70vh", minHeight: 500 }}
              allow="camera; microphone"
              title="Character Studio"
            />
          </div>
        </div>
      )}

      {/* 파일 업로드 */}
      {subTab === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            dragging
              ? "border-black bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium mb-1">
            VRM 파일을 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-gray-400 text-sm">.vrm 파일만 지원</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".vrm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
        </div>
      )}
    </div>
  );
}
