"use client";
import { useEffect, useState } from "react";
import { Search, ChevronRight, FileText, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Artist {
  id: string;
  name: string;
  nameEn: string | null;
  agency: string | null;
  groupImageUrl: string | null;
  _count?: { posts: number };
}

interface Post {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  createdAt: string;
  author: { nickname: string | null };
}

const CATEGORY_LABELS: Record<string, string> = {
  REMIX: "리믹스", VIRTUAL: "버추얼", CONCEPT: "컨셉",
  PERFORMANCE: "퍼포먼스", IDOL_PROJECT: "아이돌 프로젝트", GLOBAL_SYNC: "글로벌 싱크",
};


const ARTIST_IMAGES: Record<string, string> = {
  "(G)I-DLE": "/images/1.png",
  "aespa": "/images/2.png",
  "BLACKPINK": "/images/3.png",
  "BTS": "/images/4.png",
  "ENHYPEN": "/images/5.jpg",
  "EXO": "/images/6.jpg",
  "IVE": "/images/7.jpg",
  "LE SSERAFIM": "/images/8.jpg",
  "LNGSHOT": "/images/9.png",
  "NCT WISH": "/images/10.jpg",
  "NewJeans": "/images/11.jpg",
  "Red Velvet": "/images/12.jpg",
  "SEVENTEEN": "/images/13.jpg",
  "SHINee": "/images/14.png",
  "Stray Kids": "/images/15.jpg",
  "TWICE": "/images/16.jpg",
};

const AGENCY_COLORS: Record<string, string> = {
  HYBE: "bg-blue-50 text-blue-700",
  SM: "bg-orange-50 text-orange-700",
  YG: "bg-gray-100 text-gray-700",
  JYP: "bg-green-50 text-green-700",
  ADOR: "bg-pink-50 text-pink-700",
  Starship: "bg-purple-50 text-purple-700",
  Cube: "bg-yellow-50 text-yellow-700",
  "MORE VISION": "bg-indigo-50 text-indigo-700",
};

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/artists")
      .then(r => r.json())
      .then(d => { if (d.success) setArtists(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleArtistClick = async (artist: Artist) => {
    setSelectedArtist(artist);
    setPostsLoading(true);
    setPosts([]);
    fetch(`/api/artists/${artist.id}/posts?limit=50`)
      .then(r => r.json())
      .then(d => { if (d.success) setPosts(d.data || d.posts || []); })
      .finally(() => setPostsLoading(false));
  };

  const filtered = artists.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.agency?.toLowerCase().includes(search.toLowerCase())
  );

  // 소속사별 그룹화
  const grouped = filtered.reduce((acc, artist) => {
    const agency = artist.agency || "기타";
    if (!acc[agency]) acc[agency] = [];
    acc[agency].push(artist);
    return acc;
  }, {} as Record<string, Artist[]>);

  return (
    <div className="p-8 flex gap-6">
      {/* 좌측: 아티스트 목록 */}
      <div className={`${selectedArtist ? "w-1/2" : "w-full"} transition-all`}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">아티스트 관리</h1>
            <p className="text-sm text-gray-500 mt-1">총 {artists.length}개 아티스트</p>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="아티스트명 또는 소속사 검색..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
        </div>

        {/* 소속사별 그룹 */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).sort().map(([agency, agencyArtists]) => (
              <div key={agency}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${AGENCY_COLORS[agency] || "bg-gray-100 text-gray-600"}`}>
                    {agency}
                  </span>
                  <span className="text-xs text-gray-400">{agencyArtists.length}팀</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {agencyArtists.map(artist => (
                    <button key={artist.id}
                      onClick={() => handleArtistClick(artist)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                        selectedArtist?.id === artist.id
                          ? "border-black bg-gray-50"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {ARTIST_IMAGES[artist.name] || artist.groupImageUrl ? (
                            <Image src={ARTIST_IMAGES[artist.name] || artist.groupImageUrl!} alt={artist.name} width={36} height={36} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-xs font-bold text-gray-500">{artist.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{artist.name}</p>
                          {artist.nameEn && artist.nameEn !== artist.name && (
                            <p className="text-xs text-gray-400">{artist.nameEn}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {artist._count?.posts != null && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">
                            <FileText className="w-3 h-3" />
                            {artist._count.posts}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 우측: 선택된 아티스트 게시물 */}
      {selectedArtist && (
        <div className="w-1/2 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* 헤더 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {ARTIST_IMAGES[selectedArtist.name] || selectedArtist.groupImageUrl ? (
                    <Image src={ARTIST_IMAGES[selectedArtist.name] || selectedArtist.groupImageUrl!} alt={selectedArtist.name} width={32} height={32} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{selectedArtist.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedArtist.name} 게시물</p>
                  <p className="text-xs text-gray-400">총 {postsLoading ? "..." : posts.length}개</p>
                </div>
              </div>
              <button onClick={() => setSelectedArtist(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* 게시물 목록 */}
            <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
              {postsLoading ? (
                <div className="p-5 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">게시물이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {posts.map(post => (
                    <Link key={post.id} href={`/post/${post.id}`} target="_blank"
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{post.author.nickname}</span>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                            {CATEGORY_LABELS[post.category] || post.category}
                          </span>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs text-gray-400">조회 {post.viewCount}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-3 flex-shrink-0">
                        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
