import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

const STYLE_PROMPTS: Record<string, string> = {
  idol: "glamorous K-pop idol, trendy fashion, sparkling, stage-ready",
  pure: "soft and pure aesthetic, gentle expression, clean natural look",
  powerful: "powerful charismatic look, bold confident expression, fierce",
  dark: "dark mysterious aesthetic, dramatic lighting, gothic undertones",
  fantasy: "ethereal fantasy aesthetic, dreamy atmosphere, surreal beauty",
  retro: "retro vintage aesthetic, 80s 90s inspired, nostalgic mood",
};

const GENDER_PROMPTS: Record<string, string> = {
  female: "beautiful young woman",
  male: "handsome young man",
  neutral: "androgynous young person, gender-neutral beauty",
};

async function generateWithReplicate(prompt: string): Promise<string> {
  // 1) 프레딕션 생성
  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "black-forest-labs/flux-schnell",
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "3:4",
        output_format: "jpg",
        output_quality: 90,
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Replicate create failed: ${createRes.status} ${err}`);
  }

  const prediction = await createRes.json();
  const predictionId = prediction.id;

  // 2) 완료될 때까지 폴링 (최대 60초)
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const pollRes = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
      }
    );
    const result = await pollRes.json();

    if (result.status === "succeeded") {
      const output = result.output;
      if (Array.isArray(output) && output.length > 0) return output[0];
      if (typeof output === "string") return output;
      throw new Error("Unexpected output format");
    }

    if (result.status === "failed" || result.status === "canceled") {
      throw new Error(`Replicate prediction ${result.status}: ${result.error || "unknown"}`);
    }
  }

  throw new Error("Replicate prediction timed out");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const { gender, skinTone, stylePreset, customPrompt } = await req.json();

  const job = await prisma.aIJob.create({
    data: {
      userId: session.user.id,
      type: "VIRTUAL_GENERATE",
      status: "PROCESSING",
      inputData: { gender, skinTone, stylePreset, customPrompt },
    },
  });

  // 백그라운드에서 AI 이미지 생성
  (async () => {
    try {
      if (!REPLICATE_API_TOKEN || REPLICATE_API_TOKEN === "your-replicate-token") {
        throw new Error("REPLICATE_API_TOKEN not configured");
      }

      const genderDesc = GENDER_PROMPTS[gender] || GENDER_PROMPTS.female;
      const styleDesc = STYLE_PROMPTS[stylePreset] || STYLE_PROMPTS.idol;
      const skinDesc = skinTone ? `skin tone ${skinTone}` : "";

      const prompt = [
        `Professional portrait photo of a ${genderDesc}`,
        styleDesc,
        skinDesc,
        customPrompt,
        "K-pop idol, studio lighting, high quality, detailed face, 4k, photorealistic",
      ]
        .filter(Boolean)
        .join(", ");

      const imageUrl = await generateWithReplicate(prompt);

      await prisma.aIJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          outputData: { imageUrl },
        },
      });
    } catch (error: unknown) {
      console.error("[virtual/generate] AI generation failed:", error);
      const message = error instanceof Error ? error.message : "이미지 생성에 실패했습니다";
      await prisma.aIJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: message,
        },
      });
    }
  })();

  return NextResponse.json({ success: true, data: { jobId: job.id } });
}
