import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ko|${targetLang}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseStatus === 200) return data.responseData.translatedText;
  throw new Error("Translation failed: " + data.responseDetails);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { texts, targetLang } = await req.json();
  if (!Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ success: false, error: "texts 배열 필요" }, { status: 400 });
  }

  try {
    const batchSize = 5;
    const results: string[] = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const translated = await Promise.all(batch.map((t: string) => translateText(t, targetLang).catch(() => t)));
      results.push(...translated);
      if (i + batchSize < texts.length) await new Promise((r) => setTimeout(r, 200));
    }
    return NextResponse.json({ success: true, data: results });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
