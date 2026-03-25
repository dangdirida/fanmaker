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
    // timedtext API 직접 호출 (가장 안정적)
    const timedtextUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=ko&fmt=json3`;
    const res = await fetch(timedtextUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    let data = null;
    if (res.ok) {
      data = await res.json().catch(() => null);
    }

    // ko 없으면 자동생성 시도
    if (!data || !data.events || data.events.length === 0) {
      const autoRes = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=ko&kind=asr&fmt=json3`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      if (autoRes.ok) {
        data = await autoRes.json().catch(() => null);
      }
    }

    // en 시도
    if (!data || !data.events || data.events.length === 0) {
      const enRes = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      if (enRes.ok) {
        data = await enRes.json().catch(() => null);
      }
    }

    if (!data || !data.events || data.events.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        noCaption: true,
        message: "이 영상에는 자막이 없습니다. 자막이 활성화된 영상을 사용해주세요.",
      });
    }

    const fmt = (ms: number) => {
      const totalSec = Math.floor(ms / 1000);
      const h = Math.floor(totalSec / 3600).toString().padStart(2, "0");
      const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
      const s = (totalSec % 60).toString().padStart(2, "0");
      const msStr = (ms % 1000).toString().padStart(3, "0");
      return `${h}:${m}:${s},${msStr}`;
    };

    const lines = (data.events || [])
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
