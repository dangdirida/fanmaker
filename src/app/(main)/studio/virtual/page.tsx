"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Pencil, Eye, Video, Send, CheckCircle } from "lucide-react";

// SSR 방지 dynamic imports
const VRMCustomizer = dynamic(() => import("./components/VRMCustomizer"), {
  ssr: false,
});
const VRMViewer = dynamic(() => import("./components/VRMViewer"), {
  ssr: false,
});
const VRMExperience = dynamic(() => import("./components/VRMExperience"), {
  ssr: false,
});
const VRMPublish = dynamic(() => import("./components/VRMPublish"), {
  ssr: false,
});

const TABS = [
  { key: "customize", label: "커스터마이즈", icon: Pencil },
  { key: "preview", label: "프리뷰", icon: Eye },
  { key: "experience", label: "나로 체험", icon: Video },
  { key: "publish", label: "게시하기", icon: Send },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function VirtualStudioPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("customize");
  const [vrmFile, setVrmFile] = useState<File | null>(null);
  const [vrmUrl, setVrmUrl] = useState<string | null>(null);

  const handleVRMLoad = useCallback((file: File, url: string) => {
    setVrmFile(file);
    setVrmUrl(url);
    setActiveTab("preview");
  }, []);

  const isVrmReady = !!vrmUrl;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            버추얼 아이돌 스튜디오
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            VRM 아바타를 만들고, 프리뷰하고, 웹캠으로 체험하세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center gap-1 mb-8 bg-gray-100 p-1 rounded-2xl">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isDisabled = i > 0 && !isVrmReady;
            return (
              <button
                key={tab.key}
                onClick={() => !isDisabled && setActiveTab(tab.key)}
                disabled={isDisabled}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : isDisabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.key === "customize" && isVrmReady && (
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* VRM 상태 표시 */}
        {isVrmReady && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">
              VRM 로드됨: <strong>{vrmFile?.name || "character.vrm"}</strong>
            </span>
            <button
              onClick={() => {
                setVrmFile(null);
                setVrmUrl(null);
                setActiveTab("customize");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 ml-2 transition-colors"
            >
              초기화
            </button>
          </div>
        )}

        {/* 탭 콘텐츠 */}
        {activeTab === "customize" && (
          <VRMCustomizer onVRMLoad={handleVRMLoad} />
        )}

        {activeTab === "preview" && vrmUrl && (
          <VRMViewer vrmUrl={vrmUrl} />
        )}

        {activeTab === "experience" && vrmUrl && (
          <VRMExperience vrmUrl={vrmUrl} />
        )}

        {activeTab === "publish" && vrmUrl && (
          <VRMPublish vrmUrl={vrmUrl} vrmFile={vrmFile} />
        )}
      </div>
    </div>
  );
}
