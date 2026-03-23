import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const client = new Anthropic();

function parseJSON(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("JSON not found");
  return JSON.parse(match[0]);
}

async function callClaude(prompt: string, maxTokens = 800): Promise<string> {
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
    if (action === "worldbuilding") {
      const text = await callClaude(
        `K-pop 아이돌 그룹 세계관을 JSON으로만 생성하세요.
키워드: ${data.keywords}
분위기: ${data.mood === "bright" ? "밝고 희망적" : data.mood === "dark" ? "어둡고 신비" : "균형잡힌"}
JSON만 출력(설명없이):{"title":"제목","summary":"요약2문장","background":"배경3문장","conflict":"갈등2문장","symbolism":"상징1문장","keywords":["k1","k2","k3","k4","k5"]}`
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    if (action === "names") {
      const text = await callClaude(
        `K-pop 그룹 이름 10개를 JSON으로만 생성하세요.
키워드:${data.keywords} 무드:${data.mood} 장르:${(data.genres||[]).join(",")}
JSON만 출력:{"candidates":[{"name":"이름","meaning":"의미","romanization":"영문"},{"name":"이름","meaning":"의미","romanization":"영문"},{"name":"이름","meaning":"의미","romanization":"영문"},{"name":"이름","meaning":"의미","romanization":"영문"},{"name":"이름","meaning":"의미","romanization":"영문"},{"name":"이름","meaning":"의미","romanization":"영문"},{"name":"이름","meaning":"의미","romanization":"영문"},{"name":"이름","meaning":"의미","romanization":"영문"},{"name":"이름","meaning":"의미","romanization":"영문"},{"name":"이름","meaning":"의미","romanization":"영문"}]}`
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    if (action === "member") {
      const text = await callClaude(
        `K-pop 그룹 "${data.groupName}" 멤버${Number(data.memberIndex)+1} 캐릭터를 JSON으로만 생성하세요.
세계관:${data.worldSummary||""} 장르:${(data.genres||[]).join(",")}
JSON만 출력:{"name":"한글이름","nameEn":"영문","personality":"성격2문장","role":"역할1문장","catchphrase":"문구10자이내"}`,
        400
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    if (action === "finalProfile") {
      const memberNames = Array.isArray(data.members)
        ? data.members.map((m: {name:string}) => m.name).filter(Boolean).join(", ")
        : "";
      const text = await callClaude(
        `K-pop 그룹 "${data.groupName}" 공식 프로필을 JSON으로만 생성하세요.
세계관:${(data.worldbuilding as {summary?:string})?.summary||""} 멤버:${memberNames}
JSON만 출력:{"officialBio":"소개3문장","debutConcept":"데뷔컨셉1문장","fandomName":"팬덤이름과의미","colorCode":"#hex","colorName":"색상이름","slogan":"슬로건15자이내"}`,
        500
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    return NextResponse.json({ success: false, error: "unknown action" }, { status: 400 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[idol-project/${action}]`, msg);
    return NextResponse.json({ success: false, error: msg.substring(0, 200) }, { status: 500 });
  }
}
