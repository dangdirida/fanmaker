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
    // 여러 User-Agent / Accept-Language 조합 시도
    const fetchAttempts = [
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      },
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      },
    ];

    let html = "";
    for (const attempt of fetchAttempts) {
      const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: attempt.headers,
      });
      html = await res.text();
      if (html.includes("captionTracks")) break;
    }

    // captionTracks 추출 - 여러 패턴 시도
    let tracks = null;
    const patterns = [
      /"captionTracks":\s*(\[.*?\])/,
      /"captionTracks":\s*(\[[\s\S]*?\])\s*,\s*"/,
      /captionTracks":(.*?])/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        try {
          tracks = JSON.parse(match[1].replace(/\\u0026/g, "&"));
          if (Array.isArray(tracks) && tracks.length > 0) break;
        } catch {
          continue;
        }
      }
    }

    // playerCaptionsTracklistRenderer 방식도 시도
    if (!tracks || tracks.length === 0) {
      const altMatch = html.match(/"playerCaptionsTracklistRenderer":\s*\{[\s\S]*?"captionTracks":\s*(\[[\s\S]*?\])/);
      if (altMatch) {
        try {
          tracks = JSON.parse(altMatch[1].replace(/\\u0026/g, "&"));
        } catch {
          tracks = null;
        }
      }
    }

    if (!tracks || tracks.length === 0) {
      // 자막 없음 - 프론트에서 폴백 처리할 수 있도록 noCaption 플래그 반환
      return NextResponse.json({
        success: true,
        data: [],
        noCaption: true,
        message: "자막 없음",
      });
    }

    // 자막 트랙 우선순위: 한국어 수동 > 한국어 자동 > 자동생성 > 첫 번째
    const koTrack =
      tracks.find((t: { languageCode: string; kind?: string }) => t.languageCode === "ko" && t.kind !== "asr") ||
      tracks.find((t: { languageCode: string }) => t.languageCode === "ko") ||
      tracks.find((t: { kind?: string }) => t.kind === "asr") ||
      tracks[0];

    if (!koTrack?.baseUrl) {
      return NextResponse.json({
        success: true,
        data: [],
        noCaption: true,
        message: "자막 없음",
      });
    }

    const subtitleRes = await fetch(koTrack.baseUrl + "&fmt=json3");
    const subtitleData = await subtitleRes.json();

    const lines = (subtitleData.events || [])
      .filter((e: { segs?: unknown[] }) => e.segs && Array.isArray(e.segs))
      .map((e: { tStartMs: number; dDurationMs?: number; segs: Array<{ utf8: string }> }, idx: number) => {
        const text = e.segs
          .map((s) => s.utf8)
          .join("")
          .replace(/\n/g, " ")
          .trim();
        if (!text || text === " ") return null;
        const startSec = e.tStartMs / 1000;
        const endSec = (e.tStartMs + (e.dDurationMs || 3000)) / 1000;
        const fmt = (s: number) => {
          const m = Math.floor(s / 60).toString().padStart(2, "0");
          const sec = Math.floor(s % 60).toString().padStart(2, "0");
          return `00:${m}:${sec}`;
        };
        return {
          id: idx + 1,
          startTime: fmt(startSec),
          endTime: fmt(endSec),
          startMs: e.tStartMs,
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
