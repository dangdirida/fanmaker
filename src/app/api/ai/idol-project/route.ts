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

function parseJSON(text: string): Record<string, unknown> {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("JSON not found in response");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  let body: { action: string; data: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "잘못된 요청" }, { status: 400 });
  }

  const { action, data } = body;

  try {
    if (action === "worldbuilding") {
      const keywords = String(data.keywords || "");
      const mood = String(data.mood || "bright");
      const moodLabel = mood === "bright" ? "밝고 희망적인" : mood === "dark" ? "어둡고 신비로운" : "중립적이고 균형 잡힌";

      const text = await callClaude(
        `K-pop 아이돌 그룹의 세계관을 생성해주세요.
키워드: ${keywords}
분위기: ${moodLabel}

반드시 JSON만 응답하세요 (다른 텍스트, 설명, 마크다운 없이):
{"title":"세계관제목","summary":"요약2-3문장","background":"배경4-5문장","conflict":"중심갈등2-3문장","symbolism":"핵심상징1-2문장","keywords":["키워드1","키워드2","키워드3","키워드4","키워드5"]}`,
        800
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    if (action === "names") {
      const keywords = String(data.keywords || "");
      const mood = String(data.mood || "bright");
      const worldTitle = String(data.worldTitle || "");
      const genres = Array.isArray(data.genres) ? (data.genres as string[]).join(", ") : "K-pop";
      const differentiation = String(data.differentiation || "");

      const text = await callClaude(
        `K-pop 아이돌 그룹 이름 후보 10개를 생성해주세요.
세계관 키워드: ${keywords}
분위기: ${mood}
세계관: ${worldTitle}
장르: ${genres}
차별화: ${differentiation}

반드시 JSON만 응답하세요:
{"candidates":[{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"}]}`,
        1000
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    if (action === "member") {
      const memberIndex = Number(data.memberIndex ?? 0);
      const groupName = String(data.groupName || "");
      const worldSummary = String(data.worldSummary || "");
      const genres = Array.isArray(data.genres) ? (data.genres as string[]).join(", ") : "K-pop";

      const text = await callClaude(
        `K-pop 아이돌 그룹 "${groupName}"의 멤버 ${memberIndex + 1}의 캐릭터를 생성해주세요.
세계관: ${worldSummary}
장르: ${genres}

반드시 JSON만 응답하세요:
{"name":"한글이름","nameEn":"영문이름","personality":"성격2문장","role":"역할1문장","catchphrase":"시그니처문구10자이내"}`,
        400
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    if (action === "finalProfile") {
      const groupName = String(data.groupName || "");
      const worldbuilding = data.worldbuilding as Record<string, unknown> | null;
      const groupConcept = data.groupConcept as Record<string, unknown> | null;
      const members = Array.isArray(data.members)
        ? (data.members as Array<{name: string}>).map(m => m.name).filter(Boolean).join(", ")
        : "";

      const text = await callClaude(
        `K-pop 아이돌 그룹 "${groupName}"의 공식 프로필을 작성해주세요.
세계관: ${worldbuilding?.summary || ""}
장르: ${Array.isArray(groupConcept?.genres) ? (groupConcept.genres as string[]).join(", ") : "K-pop"}
멤버: ${members}
차별화: ${String(groupConcept?.differentiation || "")}

반드시 JSON만 응답하세요:
{"officialBio":"공식소개3-4문장","debutConcept":"데뷔컨셉1-2문장","fandomName":"팬덤이름및의미","colorCode":"#hex색상","colorName":"색상이름","slogan":"슬로건15자이내"}`,
        600
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    return NextResponse.json({ success: false, error: "알 수 없는 action" }, { status: 400 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`Idol project [${action}] error:`, msg);
    return NextResponse.json(
      { success: false, error: msg.substring(0, 150) },
      { status: 500 }
    );
  }
}
