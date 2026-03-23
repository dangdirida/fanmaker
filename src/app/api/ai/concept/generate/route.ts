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

  const prompt = `K-pop 컨셉 디렉터로서 아래 정보를 바탕으로 K-pop 컨셉 키트를 생성해주세요.

아티스트: ${artistName}
무드: ${mood}
키워드: ${(keywords || []).join(", ") || "없음"}
대표색상: ${primaryColor}
${albumName ? `앨범 방향: ${albumName}` : ""}
${targetAudience ? `타겟: ${targetAudience}` : ""}

반드시 JSON만 출력하세요. 설명이나 마크다운 없이:
{"albumTitle":"앨범타이틀","titleTrack":"타이틀곡명","concept":"컨셉설명2-3줄","tagline":"태그라인10자이내","tracks":[{"title":"트랙명","mood":"분위기","description":"한줄설명"},{"title":"트랙명","mood":"분위기","description":"한줄설명"},{"title":"트랙명","mood":"분위기","description":"한줄설명"},{"title":"트랙명","mood":"분위기","description":"한줄설명"},{"title":"트랙명","mood":"분위기","description":"한줄설명"}],"palette":["${primaryColor}","#hex2","#hex3","#hex4","#hex5"],"visualDirection":"비주얼방향2-3줄","styling":"스타일링2-3줄","stageDirection":"무대연출2-3줄","moodKeywords":["키워드1","키워드2","키워드3","키워드4","키워드5","키워드6"],"coverStyle":"앨범커버스타일"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const conceptData = parseJSON(text);
    return NextResponse.json({ success: true, data: conceptData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Concept generation error:", msg);
    return NextResponse.json({ success: false, error: msg.substring(0, 100) }, { status: 500 });
  }
}
