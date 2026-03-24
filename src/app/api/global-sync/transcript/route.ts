import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YoutubeTranscript } from "youtube-transcript";

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
    // youtube-transcript 라이브러리로 자막 추출
    // 한국어 자막 먼저 시도, 없으면 어떤 언어든 가져오기
    let transcript;
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: "ko" });
    } catch {
      // 한국어 없으면 기본 언어로 시도
      try {
        transcript = await YoutubeTranscript.fetchTranscript(videoId);
      } catch {
        transcript = null;
      }
    }

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        noCaption: true,
        message: "자막 없음",
      });
    }

    const fmt = (s: number) => {
      const m = Math.floor(s / 60).toString().padStart(2, "0");
      const sec = Math.floor(s % 60).toString().padStart(2, "0");
      return `00:${m}:${sec}`;
    };

    const lines = transcript
      .filter((item) => item.text && item.text.trim())
      .map((item, idx) => {
        const startSec = item.offset / 1000;
        const endSec = (item.offset + (item.duration || 3000)) / 1000;
        return {
          id: idx + 1,
          startTime: fmt(startSec),
          endTime: fmt(endSec),
          startMs: item.offset,
          original: item.text.replace(/\n/g, " ").trim(),
          translated: "",
        };
      });

    return NextResponse.json({ success: true, data: lines, total: lines.length });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    // 자막 비활성화 에러 처리
    if (msg.includes("disabled") || msg.includes("Could not get")) {
      return NextResponse.json({
        success: true,
        data: [],
        noCaption: true,
        message: "자막 없음",
      });
    }
    return NextResponse.json({ success: false, error: msg.substring(0, 200) }, { status: 500 });
  }
}
