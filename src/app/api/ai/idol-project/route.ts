import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const client = new Anthropic();

async function callClaude(prompt: string, maxTokens = 1000): Promise<string> {
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text : "";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { action, data } = await req.json();

  try {
    // ── 세계관 생성 ──
    if (action === "worldbuilding") {
      const { keywords, mood } = data;
      const moodLabel = mood === "bright" ? "밝고 희망적인" : mood === "dark" ? "어둡고 신비로운" : "중립적이고 균형 잡힌";
      const text = await callClaude(`K-pop 아이돌 그룹의 세계관을 생성해주세요.

키워드: ${keywords}
분위기: ${moodLabel}

아래 JSON 형식으로만 응답하세요:
{
  "title": "세계관 제목 (한글, 10자 이내)",
  "summary": "세계관 요약 (2-3문장, 한글)",
  "background": "세계관 배경 설명 (4-5문장, 한글)",
  "conflict": "중심 갈등 또는 미션 (2-3문장, 한글)",
  "symbolism": "핵심 상징 또는 모티프 (1-2문장, 한글)",
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3", "핵심키워드4", "핵심키워드5"]
}`, 800);

      const json = JSON.parse(text.match(/\{[\s\S]*\}/)![0]);
      return NextResponse.json({ success: true, data: json });
    }

    // ── 그룹 이름 생성 ──
    if (action === "names") {
      const { keywords, mood, worldTitle, genres, differentiation } = data;
      const text = await callClaude(`K-pop 아이돌 그룹 이름 후보 10개를 생성해주세요.

세계관 키워드: ${keywords}
분위기: ${mood}
세계관 제목: ${worldTitle || "없음"}
장르: ${genres?.join(", ") || "K-pop"}
차별화 포인트: ${differentiation || "없음"}

아래 JSON 형식으로만 응답하세요:
{
  "candidates": [
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"},
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"},
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"},
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"},
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"},
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"},
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"},
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"},
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"},
    {"name": "한글이름", "meaning": "의미 설명", "romanization": "영문"}
  ]
}`, 1000);

      const json = JSON.parse(text.match(/\{[\s\S]*\}/)![0]);
      return NextResponse.json({ success: true, data: json });
    }

    // ── 멤버 캐릭터 AI 생성 ──
    if (action === "member") {
      const { memberIndex, groupName, worldSummary, genres } = data;
      const text = await callClaude(`K-pop 아이돌 그룹 "${groupName}"의 멤버 ${memberIndex + 1}의 캐릭터를 생성해주세요.

세계관: ${worldSummary || "없음"}
장르: ${genres?.join(", ") || "K-pop"}

아래 JSON으로만 응답:
{
  "name": "한글이름 (1-2자)",
  "nameEn": "영문이름",
  "personality": "성격 설명 2문장",
  "role": "세계관 내 역할 1문장",
  "catchphrase": "이 멤버의 시그니처 문구 (10자 이내)"
}`, 400);

      const json = JSON.parse(text.match(/\{[\s\S]*\}/)![0]);
      return NextResponse.json({ success: true, data: json });
    }

    // ── 전체 프로필 카드 생성 ──
    if (action === "finalProfile") {
      const { groupName, worldbuilding, groupConcept, members } = data;
      const text = await callClaude(`K-pop 아이돌 그룹 "${groupName}"의 공식 프로필 소개글을 작성해주세요.

세계관: ${worldbuilding?.summary || "없음"}
장르: ${groupConcept?.genres?.join(", ") || "K-pop"}
멤버: ${members?.map((m: { name: string }) => m.name).join(", ")}
차별화: ${groupConcept?.differentiation || "없음"}

아래 JSON으로만 응답:
{
  "officialBio": "공식 소개문 (3-4문장, 한글)",
  "debutConcept": "데뷔 컨셉 및 타이틀 (1-2문장)",
  "fandomName": "팬덤 이름 및 의미",
  "colorCode": "#hex색상코드 (그룹 대표색)",
  "colorName": "색상 이름",
  "slogan": "그룹 슬로건 (한글 15자 이내)"
}`, 600);

      const json = JSON.parse(text.match(/\{[\s\S]*\}/)![0]);
      return NextResponse.json({ success: true, data: json });
    }

    return NextResponse.json({ success: false, error: "알 수 없는 action" }, { status: 400 });
  } catch (error) {
    console.error("Idol project error:", error);
    return NextResponse.json({ success: false, error: String(error).substring(0, 100) }, { status: 500 });
  }
}
