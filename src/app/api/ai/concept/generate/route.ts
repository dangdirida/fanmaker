import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const body = await req.json();
  const { artist, mood, keywords, targetAudience, albumDirection, colorCode } = body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "API 키 없음" }, { status: 500 });
  }

  const prompt = `당신은 K-pop 전문 크리에이티브 디렉터입니다.
다음 정보를 바탕으로 K-pop 컨셉 키트를 한국어로 생성해주세요.

아티스트: ${artist}
무드: ${mood}
키워드: ${(keywords || []).join(", ")}
타겟 오디언스: ${targetAudience || "전 연령"}
앨범/타이틀 방향: ${albumDirection || "자유"}
대표 색상: ${colorCode || "#000000"}

다음 JSON 형식으로만 응답하세요 (마크다운 없이):
{
  "conceptTitle": "컨셉 제목 (10자 이내)",
  "conceptDescription": "컨셉 설명 (100자 이내)",
  "albumTitle": "앨범 타이틀 추천",
  "titleTrack": "타이틀 곡명 추천",
  "visualDirection": "비주얼 방향성 (50자 이내)",
  "styleKeywords": ["스타일 키워드1", "스타일 키워드2", "스타일 키워드3"],
  "colorPalette": ["색상1", "색상2", "색상3"],
  "moodBoard": ["무드보드 요소1", "무드보드 요소2", "무드보드 요소3"],
  "targetMessage": "팬들에게 전달할 메시지 (50자 이내)",
  "marketingAngle": "마케팅 포인트 (50자 이내)"
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
