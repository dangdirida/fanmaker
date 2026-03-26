"use client";
import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";

interface Artist {
  id: string;
  name: string;
  group: string | null;
  imageUrl: string | null;
  _count?: { posts: number };
}

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/artists")
      .then(r => r.json())
      .then(d => { if (d.success) setArtists(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = artists.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    await fetch(`/api/admin/artists/${id}`, { method: "DELETE" });
    setArtists(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">아티스트 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {artists.length}명의 아티스트</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="아티스트 검색..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-24 animate-pulse" />
        )) : filtered.map(artist => (
          <div key={artist.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {artist.imageUrl ? (
                  <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-gray-500">{artist.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{artist.name}</p>
                {artist.group && <p className="text-xs text-gray-400">{artist.group}</p>}
              </div>
            </div>
            <button onClick={() => handleDelete(artist.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
