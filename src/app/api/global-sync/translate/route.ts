import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const LANG_NAMES: Record<string, string> = {
  en: "English", ja: "Japanese", "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese", es: "Spanish", pt: "Portuguese",
  th: "Thai", id: "Indonesian", vi: "Vietnamese", fr: "French",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { texts, targetLang } = await req.json();
  if (!Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ success: false, error: "texts 배열 필요" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 });
  }

  const langName = LANG_NAMES[targetLang] || targetLang;
  const numbered = texts.map((t: string, i: number) => `[${i + 1}] ${t}`).join("\n");
  const prompt = `Translate each numbered subtitle line from Korean to ${langName}.
Keep the [number] tags exactly as-is. Only translate the text after the tag.
Return only the translated lines in the same format, nothing else.

${numbered}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8000, temperature: 0.2 },
      }),
    });

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const map: Record<number, string> = {};
    for (const line of raw.split("\n")) {
      const match = line.match(/^\[(\d+)\]\s*(.+)/);
      if (match) map[parseInt(match[1])] = match[2].trim();
    }

    const results = texts.map((t: string, i: number) => map[i + 1] || t);
    return NextResponse.json({ success: true, data: results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
