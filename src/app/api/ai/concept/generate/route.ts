import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const body = await req.json();
  const { artistName, mood, keywords, primaryColor, albumName, targetAudience } = body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "GEMINI_API_KEY가 설정되지 않았습니다. .env.local에 추가해주세요." },
      { status: 500 }
    );
  }

  const prompt = `당신은 K-pop 전문 크리에이티브 디렉터입니다.
다음 정보를 바탕으로 K-pop 아이돌 그룹의 컨셉 키트를 한국어로 생성해주세요.

그룹명: ${artistName || "미정"}
무드: ${mood || "자유"}
키워드: ${(keywords || []).join(", ") || "없음"}
앨범/타이틀 방향: ${albumName || "자유"}
타겟 오디언스: ${targetAudience || "전 연령"}
대표 색상: ${primaryColor || "#6366f1"}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "albumTitle": "앨범명 (한국어 또는 영어, 창의적으로)",
  "titleTrack": "타이틀곡 이름",
  "concept": "컨셉 설명 (3~4문장으로 세계관과 분위기를 묘사)",
  "tagline": "한 줄 태그라인 (15자 이내)",
  "tracks": [
    { "title": "곡 제목", "mood": "곡의 분위기", "description": "곡 설명 한 문장" },
    { "title": "곡 제목", "mood": "곡의 분위기", "description": "곡 설명 한 문장" },
    { "title": "곡 제목", "mood": "곡의 분위기", "description": "곡 설명 한 문장" },
    { "title": "곡 제목", "mood": "곡의 분위기", "description": "곡 설명 한 문장" },
    { "title": "곡 제목", "mood": "곡의 분위기", "description": "곡 설명 한 문장" }
  ],
  "palette": ["#hex색상1", "#hex색상2", "#hex색상3", "#hex색상4", "#hex색상5"],
  "visualDirection": "비주얼 방향성 설명 (2~3문장)",
  "styling": "스타일링 가이드 설명 (2~3문장, 의상/헤어/메이크업)",
  "stageDirection": "무대 연출 방향 설명 (2~3문장, 조명/소품/퍼포먼스)",
  "moodKeywords": ["무드키워드1", "무드키워드2", "무드키워드3", "무드키워드4", "무드키워드5"],
  "coverStyle": "앨범 커버 디자인 설명 (2~3문장)"
}

palette의 색상은 반드시 유효한 HEX 색상 코드여야 합니다.
tracks는 정확히 5곡을 포함해야 하며, 첫 번째 곡이 타이틀곡입니다.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json({ success: true, data: parsed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[concept/generate] Error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
