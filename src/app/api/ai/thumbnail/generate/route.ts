import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { prompt } = await req.json();

  const encoded = encodeURIComponent(
    `K-pop idol group concept art, ${prompt}, vibrant cinematic digital art, dramatic lighting, no text, no watermark`
  );
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}`;

  return NextResponse.json({ success: true, imageUrl });
}
