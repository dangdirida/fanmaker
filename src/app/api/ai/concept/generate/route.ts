import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function parseJSON(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("JSON not found");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { artistName, mood, keywords, primaryColor, albumName, targetAudience } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "GEMINI_API_KEY 없음" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(
      `K-pop 컨셉 키트를 JSON으로만 생성하세요. 마크다운 없이 JSON만 출력.
아티스트:${artistName} 무드:${mood} 키워드:${(keywords||[]).join(",")} 색상:${primaryColor}${albumName?` 앨범:${albumName}`:""}${targetAudience?` 타겟:${targetAudience}`:""}
{"albumTitle":"타이틀","titleTrack":"곡명","concept":"컨셉2-3줄","tagline":"태그라인10자","tracks":[{"title":"트랙","mood":"분위기","description":"설명"},{"title":"트랙","mood":"분위기","description":"설명"},{"title":"트랙","mood":"분위기","description":"설명"},{"title":"트랙","mood":"분위기","description":"설명"},{"title":"트랙","mood":"분위기","description":"설명"}],"palette":["${primaryColor}","#hex","#hex","#hex","#hex"],"visualDirection":"비주얼2-3줄","styling":"스타일2-3줄","stageDirection":"무대2-3줄","moodKeywords":["k1","k2","k3","k4","k5","k6"],"coverStyle":"커버스타일"}`
    );
    return NextResponse.json({ success: true, data: parseJSON(result.response.text()) });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Concept error:", msg);
    return NextResponse.json({ success: false, error: msg.substring(0, 100) }, { status: 500 });
  }
}
