import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const body = await req.json();
  const { artist, style, mood, originalSong } = body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "API 키 없음" }, { status: 500 });
  }

  const prompt = `당신은 K-pop 전문 음악 프로듀서입니다.
다음 정보를 바탕으로 리믹스 컨셉을 한국어로 생성해주세요.

아티스트: ${artist}
리믹스 스타일: ${style || "자유"}
무드: ${mood || "자유"}
원곡: ${originalSong || "자유"}

다음 JSON 형식으로만 응답하세요 (마크다운 없이):
{
  "remixTitle": "리믹스 제목",
  "remixStyle": "리믹스 스타일 설명 (50자 이내)",
  "bpm": "추천 BPM (숫자만)",
  "key": "추천 키 (예: C Major)",
  "instruments": ["악기1", "악기2", "악기3"],
  "structure": "곡 구조 설명 (예: 인트로-버스-코러스-브릿지)",
  "lyrics": "가사 방향성 (50자 이내)",
  "productionTips": ["프로덕션 팁1", "프로덕션 팁2", "프로덕션 팁3"],
  "referenceArtists": ["레퍼런스 아티스트1", "레퍼런스 아티스트2"],
  "uniqueElement": "이 리믹스의 독특한 요소 (50자 이내)"
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({ success: true, data: parsed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
