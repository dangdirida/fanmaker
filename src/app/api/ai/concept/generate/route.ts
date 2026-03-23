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

  const { artistName, mood, keywords, primaryColor, albumName, targetAudience } = await req.json();

  const prompt = `당신은 K-pop 컨셉 디렉터입니다. 아래 정보를 바탕으로 완성도 높은 K-pop 컨셉 키트를 JSON으로 생성해주세요.

아티스트: ${artistName}
무드: ${mood}
키워드: ${(keywords || []).join(", ")}
대표색상: ${primaryColor}
${albumName ? `앨범/타이틀명: ${albumName}` : ""}
${targetAudience ? `타겟: ${targetAudience}` : ""}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트, 설명, 마크다운 없이 JSON만:
{
  "albumTitle": "앨범 타이틀",
  "titleTrack": "타이틀곡명",
  "concept": "2-3줄 컨셉 설명",
  "tagline": "짧고 강렬한 태그라인 10자 이내",
  "tracks": [
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"}
  ],
  "palette": ["${primaryColor}", "#hex2", "#hex3", "#hex4", "#hex5"],
  "visualDirection": "비주얼 방향성 2-3줄",
  "styling": "의상 및 헤어/메이크업 방향 2-3줄",
  "stageDirection": "무대 연출 방향 2-3줄",
  "moodKeywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5", "키워드6"],
  "coverStyle": "앨범 커버 스타일 설명"
}`;

  try {
    // streaming으로 전체 텍스트 수집
    let fullText = "";

    const stream = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        fullText += event.delta.text;
      }
    }

    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", fullText.substring(0, 200));
      return NextResponse.json({ success: false, error: "JSON 파싱 실패" }, { status: 500 });
    }

    const conceptData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: conceptData });

  } catch (error) {
    console.error("Concept generation error:", error);
    return NextResponse.json(
      { success: false, error: "생성 실패: " + String(error).substring(0, 100) },
      { status: 500 }
    );
  }
}
