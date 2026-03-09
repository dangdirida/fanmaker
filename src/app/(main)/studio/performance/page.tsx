"use client";

import { useState, useCallback } from "react";
import ArtistSelector from "@/components/common/ArtistSelector";
import PublishModal from "@/components/studio/PublishModal";
import AILoadingState from "@/components/studio/AILoadingState";

type Artist = { id: string; name: string; nameEn: string | null; groupImageUrl: string | null };

interface Member {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

interface Scene {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lightingMood: LightingMood;
  effect: Effect;
  members: Member[];
}

type LightingMood = "warm" | "cool" | "neon" | "spotlight" | "strobe" | "sunset";
type Effect = "smoke" | "fireworks" | "confetti" | "none";

const LIGHTING_PRESETS: { value: LightingMood; label: string; color: string }[] = [
  { value: "warm", label: "Warm", color: "#ff9f43" },
  { value: "cool", label: "Cool", color: "#54a0ff" },
  { value: "neon", label: "Neon", color: "#ff3d7f" },
  { value: "spotlight", label: "Spotlight", color: "#feca57" },
  { value: "strobe", label: "Strobe", color: "#ffffff" },
  { value: "sunset", label: "Sunset", color: "#ff6b6b" },
];

const EFFECTS: { value: Effect; label: string; icon: string }[] = [
  { value: "none", label: "None", icon: "---" },
  { value: "smoke", label: "Smoke", icon: "~" },
  { value: "fireworks", label: "Fireworks", icon: "*" },
  { value: "confetti", label: "Confetti", icon: "%" },
];

const MEMBER_COLORS = [
  "#ff3d7f", "#ff9f43", "#feca57", "#54a0ff",
  "#5f27cd", "#01a3a4", "#2ecc71", "#e056fd", "#ff6348",
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function createDefaultMembers(count: number): Member[] {
  const members: Member[] = [];
  const centerX = 300;
  const centerY = 200;
  const radius = 120;

  for (let i = 0; i < Math.min(count, 9); i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    members.push({
      id: generateId(),
      name: `M${i + 1}`,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      color: MEMBER_COLORS[i],
    });
  }
  return members;
}

function createDefaultScene(index: number, memberCount: number): Scene {
  return {
    id: generateId(),
    name: `Scene ${index + 1}`,
    startTime: "00:00",
    endTime: "00:30",
    lightingMood: "neon",
    effect: "none",
    members: createDefaultMembers(memberCount),
  };
}

export default function PerformancePlannerPage() {
  const [showArtistSelector, setShowArtistSelector] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistName, setArtistName] = useState<string>("");
  const [memberCount] = useState(5);

  const [scenes, setScenes] = useState<Scene[]>([createDefaultScene(0, 5)]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const [draggingMemberId, setDraggingMemberId] = useState<string | null>(null);

  const handleArtistSelect = (artist: Artist | null) => {
    setSelectedArtist(artist);
    if (artist) {
      setArtistName(artist.name);
    }
    setShowArtistSelector(false);
  };

  // 씬 추가
  const addScene = useCallback(() => {
    setScenes((prev) => {
      const newScene = createDefaultScene(prev.length, memberCount);
      return [...prev, newScene];
    });
    setActiveSceneIndex((prev) => prev + 1);
  }, [memberCount]);

  // 씬 삭제
  const deleteScene = useCallback(
    (index: number) => {
      if (scenes.length <= 1) return;
      setScenes((prev) => prev.filter((_, i) => i !== index));
      setActiveSceneIndex((prev) => (prev >= index && prev > 0 ? prev - 1 : prev));
    },
    [scenes.length]
  );

  // 현재 씬 업데이트
  const updateActiveScene = useCallback(
    (updates: Partial<Scene>) => {
      setScenes((prev) =>
        prev.map((scene, i) => (i === activeSceneIndex ? { ...scene, ...updates } : scene))
      );
    },
    [activeSceneIndex]
  );

  // 멤버 위치 업데이트
  const updateMemberPosition = useCallback(
    (memberId: string, x: number, y: number) => {
      setScenes((prev) =>
        prev.map((scene, i) =>
          i === activeSceneIndex
            ? {
                ...scene,
                members: scene.members.map((m) =>
                  m.id === memberId ? { ...m, x: Math.max(15, Math.min(585, x)), y: Math.max(15, Math.min(385, y)) } : m
                ),
              }
            : scene
        )
      );
    },
    [activeSceneIndex]
  );

  // 포메이션 에디터 마우스 핸들러
  const handleEditorMouseDown = (memberId: string) => {
    setDraggingMemberId(memberId);
  };

  const handleEditorMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingMemberId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateMemberPosition(draggingMemberId, x, y);
  };

  const handleEditorMouseUp = () => {
    setDraggingMemberId(null);
  };

  // 시뮬레이션
  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 3000);
  };

  // PDF 다운로드 (플레이스홀더)
  const handleDownloadPDF = () => {
    alert("PDF 다운로드 기능은 준비 중입니다.");
  };

  const activeScene = scenes[activeSceneIndex];

  if (isSimulating) {
    return <AILoadingState estimatedSeconds={15} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <ArtistSelector
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        onSelect={handleArtistSelect}
      />

      {/* 헤더 */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Performance Planner</h1>
          <p className="text-sm text-white/50 mt-0.5">
            {artistName} - {scenes.length}개 씬
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulate}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
          >
            Simulate Video
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2 rounded-lg bg-[#ff3d7f] hover:bg-[#ff3d7f]/80 text-sm font-bold transition-colors"
          >
            Publish to Feed
          </button>
        </div>
      </header>

      <div className="flex flex-1" style={{ height: "calc(100vh - 73px)" }}>
        {/* 좌측: 씬 타임라인 패널 */}
        <aside className="w-64 border-r border-white/10 flex flex-col">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/70">Scenes</span>
            <button
              onClick={addScene}
              className="w-7 h-7 rounded bg-[#ff3d7f] hover:bg-[#ff3d7f]/80 flex items-center justify-center text-sm font-bold transition-colors"
              title="씬 추가"
            >
              +
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                onClick={() => setActiveSceneIndex(index)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  index === activeSceneIndex
                    ? "bg-[#ff3d7f]/20 border border-[#ff3d7f]/40"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{scene.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {scene.startTime} - {scene.endTime}
                  </p>
                </div>
                {scenes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScene(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all text-xs"
                    title="씬 삭제"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 중앙: 포메이션 에디터 */}
          <div className="flex-1 flex items-center justify-center p-6">
            {activeScene && (
              <div
                className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden select-none"
                style={{ width: 600, height: 400 }}
                onMouseMove={handleEditorMouseMove}
                onMouseUp={handleEditorMouseUp}
                onMouseLeave={handleEditorMouseUp}
              >
                {/* 그리드 라인 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" opacity={0.1}>
                  {Array.from({ length: 11 }, (_, i) => (
                    <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={400} stroke="white" strokeWidth={1} />
                  ))}
                  {Array.from({ length: 8 }, (_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * 57.14} x2={600} y2={i * 57.14} stroke="white" strokeWidth={1} />
                  ))}
                </svg>

                {/* 스테이지 라벨 */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-white/30 tracking-widest uppercase">
                  Stage Front
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/30 tracking-widest uppercase">
                  Stage Back
                </div>

                {/* 멤버 서클 */}
                {activeScene.members.map((member) => (
                  <div
                    key={member.id}
                    onMouseDown={() => handleEditorMouseDown(member.id)}
                    className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing"
                    style={{
                      left: member.x - 18,
                      top: member.y - 18,
                      zIndex: draggingMemberId === member.id ? 50 : 10,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-shadow"
                      style={{
                        backgroundColor: member.color,
                        boxShadow:
                          draggingMemberId === member.id
                            ? `0 0 20px ${member.color}80`
                            : `0 2px 8px ${member.color}40`,
                      }}
                    >
                      {member.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단: 씬 설정 */}
          {activeScene && (
            <div className="border-t border-white/10 px-6 py-4">
              <div className="grid grid-cols-4 gap-6">
                {/* 씬 이름 */}
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Scene Name</label>
                  <input
                    type="text"
                    value={activeScene.name}
                    onChange={(e) => updateActiveScene({ name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff3d7f]/50 transition-colors"
                  />
                </div>

                {/* 시작/종료 시간 */}
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Time Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={activeScene.startTime}
                      onChange={(e) => updateActiveScene({ startTime: e.target.value })}
                      placeholder="00:00"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff3d7f]/50 transition-colors"
                    />
                    <span className="text-white/30 text-sm">-</span>
                    <input
                      type="text"
                      value={activeScene.endTime}
                      onChange={(e) => updateActiveScene({ endTime: e.target.value })}
                      placeholder="00:30"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff3d7f]/50 transition-colors"
                    />
                  </div>
                </div>

                {/* 라이팅 무드 */}
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Lighting Mood</label>
                  <div className="flex gap-1.5">
                    {LIGHTING_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => updateActiveScene({ lightingMood: preset.value })}
                        title={preset.label}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          activeScene.lightingMood === preset.value
                            ? "border-white scale-110"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: preset.color }}
                      />
                    ))}
                  </div>
                </div>

                {/* 이펙트 */}
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Effect</label>
                  <div className="flex gap-1.5">
                    {EFFECTS.map((effect) => (
                      <button
                        key={effect.value}
                        onClick={() => updateActiveScene({ effect: effect.value })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeScene.effect === effect.value
                            ? "bg-[#ff3d7f] text-white"
                            : "bg-white/5 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {effect.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        category="PERFORMANCE"
        artistId={selectedArtist?.id}
        contentData={{ scenes, artistName }}
      />
    </div>
  );
}
