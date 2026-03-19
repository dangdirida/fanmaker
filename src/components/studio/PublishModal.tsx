"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  artistId?: string | null;
  contentData: Record<string, unknown>;
  thumbnailUrl?: string | null;
  fileUrls?: string[];
}

export default function PublishModal({
  isOpen,
  onClose,
  category,
  artistId,
  contentData,
  thumbnailUrl,
  fileUrls,
}: PublishModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [publishing, setPublishing] = useState(false);

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!title.trim()) return;
    setPublishing(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        category,
        artistId: artistId || null,
        thumbnailUrl: thumbnailUrl || null,
        contentData,
        fileUrls: fileUrls || [],
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      }),
    });

    if (res.ok) {
      onClose();
      window.location.href = "/feed";
    }
    setPublishing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">피드에 게시</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">제목 *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="창작물 제목을 입력하세요"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="창작물에 대해 설명해주세요"
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">태그 (쉼표로 구분)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: 리믹스, BTS, 댄스팝"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-gray-400 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handlePublish}
            disabled={!title.trim() || publishing}
            className="flex-1 py-2.5 text-sm text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {publishing && <Loader2 className="w-4 h-4 animate-spin" />}
            게시하기
          </button>
        </div>
      </div>
    </div>
  );
}
