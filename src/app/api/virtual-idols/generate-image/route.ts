import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Replicate from "replicate";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const body = await req.json();
  const { idolId, name, gender, concept, personality, outfitStyle, skinTone, eyeColor, hairColor } = body;

  if (!idolId) {
    return NextResponse.json({ success: false, error: "idolId 필요" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  // Replicate 키가 없으면 스킵
  if (!replicateToken) {
    return NextResponse.json({
      success: true,
      data: { imageUrl: null, skipped: true, reason: "REPLICATE_API_TOKEN 미설정" },
    });
  }

  try {
    // Step 1: Gemini로 영문 이미지 프롬프트 생성
    let imagePrompt: string;

    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
      });

      const promptRequest = `Generate an English image prompt for a K-pop idol character illustration.
Character info:
- Name: ${name || "Unknown"}
- Gender: ${gender || "female"}
- Concept: ${concept || "idol"}
- Personality: ${personality || "bright"}
- Outfit: ${outfitStyle || "stage"}
- Skin tone: ${skinTone || "fair"}
- Eye color: ${eyeColor || "brown"}
- Hair color: ${hairColor || "black"}

Create a concise prompt (max 100 words) for an anime-style K-pop idol portrait illustration. Include: art style, appearance details, mood, lighting, quality tags.
Reply with ONLY the prompt text, no explanation.`;

      const result = await model.generateContent(promptRequest);
      imagePrompt = result.response.text().trim();
    } else {
      // Gemini 없으면 기본 프롬프트 사용
      const genderText = gender === "male" ? "male" : "female";
      imagePrompt = `k-pop idol portrait, anime style illustration, ${genderText} idol, ${outfitStyle || "stage"} outfit, ${concept || "idol"} concept, professional idol photoshoot, clean pastel background, high quality, detailed, beautiful lighting, soft shadows`;
    }

    // Step 2: Replicate로 이미지 생성
    const replicate = new Replicate({ auth: replicateToken });

    const output = await replicate.run(
      "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
      {
        input: {
          prompt: imagePrompt,
          negative_prompt: "ugly, deformed, blurry, low quality, nsfw, realistic photo, photorealistic, watermark, text",
          width: 512,
          height: 512,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 25,
          guidance_scale: 7.5,
        },
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : null;

    if (!imageUrl) {
      return NextResponse.json({ success: true, data: { imageUrl: null, skipped: true, reason: "이미지 생성 실패" } });
    }

    // Step 3: DB에 thumbnailUrl 업데이트
    await prisma.virtualIdol.update({
      where: { id: idolId },
      data: { thumbnailUrl: String(imageUrl) },
    });

    return NextResponse.json({
      success: true,
      data: { imageUrl: String(imageUrl), prompt: imagePrompt },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[generate-image] Error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
