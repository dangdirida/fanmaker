import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const body = await req.json();
  const { artistName, mood, keywords, primaryColor, albumName, targetAudience } = body;

  const prompt = `당신은 K-pop 컨셉 디렉터입니다. 아래 정보로 K-pop 컨셉 키트를 JSON으로만 생성하세요.

아티스트: ${artistName}
무드: ${mood}
키워드: ${(keywords || []).join(", ") || "없음"}
대표색상: ${primaryColor || "#6366f1"}
${albumName ? `앨범 방향: ${albumName}` : ""}
${targetAudience ? `타겟: ${targetAudience}` : ""}

JSON만 응답 (다른 텍스트 없이):
{
  "albumTitle": "앨범타이틀",
  "titleTrack": "타이틀곡명",
  "concept": "컨셉설명 2-3줄",
  "tagline": "태그라인 10자이내",
  "tracks": [
    {"title": "트랙명", "mood": "분위기", "description": "한줄설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한줄설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한줄설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한줄설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한줄설명"}
  ],
  "palette": ["${primaryColor || "#6366f1"}", "#hex2", "#hex3", "#hex4", "#hex5"],
  "visualDirection": "비주얼방향 2-3줄",
  "styling": "스타일링 2-3줄",
  "stageDirection": "무대연출 2-3줄",
  "moodKeywords": ["키워드1","키워드2","키워드3","키워드4","키워드5","키워드6"],
  "coverStyle": "앨범커버스타일"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("No JSON in response:", text.substring(0, 300));
      return NextResponse.json({ success: false, error: "파싱 실패" }, { status: 500 });
    }

    const conceptData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: conceptData });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Concept generation error:", errMsg);
    return NextResponse.json(
      { success: false, error: "생성 실패: " + errMsg.substring(0, 100) },
      { status: 500 }
    );
  }
}
