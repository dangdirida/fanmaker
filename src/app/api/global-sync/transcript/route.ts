import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { videoId } = await req.json();
  if (!videoId) {
    return NextResponse.json({ success: false, error: "videoId 필요" }, { status: 400 });
  }

  try {
    // YouTube 페이지에서 자막 트랙 URL 추출
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html = await pageRes.text();

    // captionTracks 추출
    const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionMatch) {
      return NextResponse.json({
        success: true, data: [], noCaption: true,
        message: "이 영상에는 자막이 없습니다. 자막이 활성화된 영상을 사용해주세요.",
      });
    }

    const tracks = JSON.parse(captionMatch[1].replace(/\\u0026/g, "&"));

    // 한국어 자막 우선, 없으면 자동생성, 없으면 첫번째
    const koTrack =
      tracks.find((t: { languageCode: string; kind?: string }) => t.languageCode === "ko" && t.kind !== "asr") ||
      tracks.find((t: { languageCode: string }) => t.languageCode === "ko") ||
      tracks.find((t: { kind?: string }) => t.kind === "asr") ||
      tracks[0];

    if (!koTrack?.baseUrl) {
      return NextResponse.json({ success: true, data: [], noCaption: true, message: "자막을 찾을 수 없습니다." });
    }

    // 자막 XML 가져오기
    const subRes = await fetch(koTrack.baseUrl + "&fmt=json3");
    const subData = await subRes.json();

    const fmt = (ms: number) => {
      const totalSec = Math.floor(ms / 1000);
      const h = Math.floor(totalSec / 3600).toString().padStart(2, "0");
      const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
      const s = (totalSec % 60).toString().padStart(2, "0");
      const msStr = (ms % 1000).toString().padStart(3, "0");
      return `${h}:${m}:${s},${msStr}`;
    };

    const lines = (subData.events || [])
      .filter((e: { segs?: unknown[] }) => e.segs && Array.isArray(e.segs))
      .map((e: { tStartMs: number; dDurationMs?: number; segs: Array<{ utf8: string }> }, idx: number) => {
        const text = e.segs.map((s) => s.utf8).join("").replace(/\n/g, " ").trim();
        if (!text || text === " ") return null;
        const startMs = e.tStartMs;
        const endMs = startMs + (e.dDurationMs || 3000);
        return {
          id: idx + 1,
          startTime: fmt(startMs),
          endTime: fmt(endMs),
          startMs,
          original: text,
          translated: "",
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, data: lines, total: lines.length });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg.substring(0, 200) }, { status: 500 });
  }
}
