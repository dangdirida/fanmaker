import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { artistName, mood, keywords, primaryColor, albumName, targetAudience } = await req.json();

  try {
    const prompt = `당신은 K-pop 컨셉 디렉터입니다. 아래 정보를 바탕으로 완성도 높은 K-pop 컨셉 키트를 JSON으로 생성해주세요.

아티스트: ${artistName}
무드: ${mood}
키워드: ${keywords.join(", ")}
대표색상: ${primaryColor}
${albumName ? `앨범/타이틀명: ${albumName}` : ""}
${targetAudience ? `타겟: ${targetAudience}` : ""}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "albumTitle": "앨범/미니앨범 타이틀 (한글+영문 혼용 가능, 임팩트 있게)",
  "titleTrack": "타이틀곡명",
  "concept": "2-3줄 컨셉 설명 (한국어)",
  "tagline": "짧고 강렬한 태그라인 (한글 10자 이내)",
  "tracks": [
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"},
    {"title": "트랙명", "mood": "분위기", "description": "한 줄 설명"}
  ],
  "palette": ["${primaryColor}", "#hex2", "#hex3", "#hex4", "#hex5"],
  "visualDirection": "비주얼 방향성 (배경, 조명, 색감 등 2-3줄)",
  "styling": "의상 및 헤어/메이크업 방향 (2-3줄)",
  "stageDirection": "무대 연출 및 퍼포먼스 방향 (2-3줄)",
  "moodKeywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5", "키워드6"],
  "coverStyle": "앨범 커버 스타일 설명 (배경색조, 텍스처, 구도 등)"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON parse failed");

    const conceptData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, data: conceptData });
  } catch (error) {
    console.error("Concept generation error:", error);
    return NextResponse.json({ success: false, error: "생성 실패" }, { status: 500 });
  }
}
