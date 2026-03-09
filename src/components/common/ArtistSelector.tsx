"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

type Artist = {
  id: string;
  name: string;
  nameEn: string | null;
  groupImageUrl: string | null;
};

interface ArtistSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (artist: Artist | null) => void;
}

export default function ArtistSelector({
  isOpen,
  onClose,
  onSelect,
}: ArtistSelectorProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("/api/artists")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setArtists(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.nameEn && a.nameEn.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-[#111] border border-gray-800 rounded-2xl p-6 max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            어떤 아티스트로 창작할까요?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 검색 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="아티스트 검색..."
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#ff3d7f] transition-colors"
          />
        </div>

        {/* 오리지널 창작 옵션 */}
        <button
          onClick={() => {
            onSelect(null);
            onClose();
          }}
          className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-[#ff3d7f]/10 to-[#c084fc]/10 border border-[#ff3d7f]/30 rounded-xl text-sm text-white hover:border-[#ff3d7f]/50 transition-colors text-left"
        >
          <span className="font-medium">선택 안 함</span>
          <span className="text-gray-400 ml-2">(오리지널 창작)</span>
        </button>

        {/* 아티스트 그리드 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-8">로딩 중...</div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {filtered.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => {
                    onSelect(artist);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-[#ff3d7f]/50 hover:bg-[#ff3d7f]/5 transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-800 flex items-center justify-center text-base overflow-hidden">
                    {artist.groupImageUrl ? (
                      <img
                        src={artist.groupImageUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">
                        {artist.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 truncate">
                    {artist.name}
                  </p>
                </button>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              검색 결과가 없어요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
