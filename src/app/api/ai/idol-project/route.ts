import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY 환경변수가 없습니다");
  return new GoogleGenerativeAI(apiKey);
}

function parseJSON(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("JSON을 찾을 수 없습니다: " + cleaned.substring(0, 200));
  return JSON.parse(match[0]);
}

async function callGemini(prompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { action, data } = await req.json();

  try {
    if (action === "worldbuilding") {
      const moodLabel =
        data.mood === "bright" ? "밝고 희망적인" :
        data.mood === "dark" ? "어둡고 신비로운" : "균형 잡힌";

      const text = await callGemini(
        `K-pop 아이돌 그룹의 세계관을 생성해주세요.
키워드: ${data.keywords}
분위기: ${moodLabel}

반드시 JSON만 출력하세요. 설명이나 마크다운 없이 JSON 객체만:
{"title":"세계관제목(10자이내)","summary":"요약2문장","background":"배경설명3-4문장","conflict":"중심갈등2문장","symbolism":"핵심상징1문장","keywords":["키워드1","키워드2","키워드3","키워드4","키워드5"]}`
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    if (action === "names") {
      const genres = Array.isArray(data.genres) ? data.genres.join(", ") : "K-pop";
      const text = await callGemini(
        `K-pop 아이돌 그룹 이름 후보 10개를 생성해주세요.
세계관 키워드: ${data.keywords}
분위기: ${data.mood}
세계관 제목: ${data.worldTitle || "없음"}
장르: ${genres}
차별화: ${data.differentiation || "없음"}

반드시 JSON만 출력하세요:
{"candidates":[{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"},{"name":"이름","meaning":"의미설명","romanization":"영문"}]}`
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    if (action === "member") {
      const genres = Array.isArray(data.genres) ? data.genres.join(", ") : "K-pop";
      const text = await callGemini(
        `K-pop 아이돌 그룹 "${data.groupName}"의 멤버 ${Number(data.memberIndex) + 1}번 캐릭터를 생성해주세요.
세계관: ${data.worldSummary || "없음"}
장르: ${genres}

반드시 JSON만 출력하세요:
{"name":"한글이름","nameEn":"영문이름","personality":"성격2문장","role":"세계관역할1문장","catchphrase":"시그니처문구10자이내"}`
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    if (action === "finalProfile") {
      const memberNames = Array.isArray(data.members)
        ? (data.members as Array<{ name: string }>).map(m => m.name).filter(Boolean).join(", ")
        : "";
      const worldSummary = (data.worldbuilding as { summary?: string } | null)?.summary || "";
      const genres = Array.isArray((data.groupConcept as { genres?: string[] } | null)?.genres)
        ? ((data.groupConcept as { genres: string[] }).genres).join(", ")
        : "K-pop";

      const text = await callGemini(
        `K-pop 아이돌 그룹 "${data.groupName}"의 공식 프로필을 작성해주세요.
세계관: ${worldSummary}
장르: ${genres}
멤버: ${memberNames}

반드시 JSON만 출력하세요:
{"officialBio":"공식소개3-4문장","debutConcept":"데뷔컨셉1-2문장","fandomName":"팬덤이름과의미","colorCode":"#hex","colorName":"색상이름","slogan":"슬로건15자이내"}`
      );
      return NextResponse.json({ success: true, data: parseJSON(text) });
    }

    return NextResponse.json({ success: false, error: "unknown action" }, { status: 400 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[idol-project/${action}] error:`, msg);
    return NextResponse.json(
      { success: false, error: msg.substring(0, 200) },
      { status: 500 }
    );
  }
}
