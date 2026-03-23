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
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
    });
    const html = await pageRes.text();

    const captionTracksMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionTracksMatch) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "이 영상에는 자막이 없습니다. 자막이 있는 영상을 사용해주세요.",
      });
    }

    const tracks = JSON.parse(captionTracksMatch[1].replace(/\\u0026/g, "&"));
    const koTrack =
      tracks.find((t: { languageCode: string; kind?: string }) => t.languageCode === "ko" && t.kind !== "asr") ||
      tracks.find((t: { languageCode: string }) => t.languageCode === "ko") ||
      tracks.find((t: { kind?: string }) => t.kind === "asr") ||
      tracks[0];

    if (!koTrack) {
      return NextResponse.json({ success: true, data: [], message: "자막을 찾을 수 없습니다." });
    }

    const subtitleRes = await fetch(koTrack.baseUrl + "&fmt=json3");
    const subtitleData = await subtitleRes.json();

    const lines = (subtitleData.events || [])
      .filter((e: { segs?: unknown[] }) => e.segs && Array.isArray(e.segs))
      .map((e: { tStartMs: number; dDurationMs?: number; segs: Array<{ utf8: string }> }, idx: number) => {
        const text = e.segs.map((s) => s.utf8).join("").replace(/\n/g, " ").trim();
        if (!text || text === " ") return null;
        const startSec = e.tStartMs / 1000;
        const endSec = (e.tStartMs + (e.dDurationMs || 3000)) / 1000;
        const fmt = (s: number) => {
          const m = Math.floor(s / 60).toString().padStart(2, "0");
          const sec = Math.floor(s % 60).toString().padStart(2, "0");
          return `00:${m}:${sec}`;
        };
        return { id: idx + 1, startTime: fmt(startSec), endTime: fmt(endSec), startMs: e.tStartMs, original: text, translated: "" };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, data: lines, total: lines.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg.substring(0, 200) }, { status: 500 });
  }
}
