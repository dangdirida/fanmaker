import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const STYLE_PROMPTS: Record<string, string> = {
  idol: "화려하고 트렌디한 K-pop 아이돌 무대 스타일, 글리터, 반짝이는 의상",
  pure: "맑고 청순한 분위기, 자연스러운 메이크업, 화이트/파스텔 의상",
  powerful: "강렬하고 카리스마 넘치는, 자신감 있는 눈빛, 다크 포인트 컬러",
  dark: "다크하고 신비로운, 드라마틱 조명, 고딕 요소",
  fantasy: "몽환적인 판타지, 비현실적 아름다움, 빛나는 이펙트",
  retro: "80-90년대 레트로 감성, 빈티지 스타일",
};

const GENDER_KO: Record<string, string> = {
  female: "여성",
  male: "남성",
  neutral: "중성적인",
};

const HAIR_COLOR_KO: Record<string, string> = {
  black: "블랙", brown: "브라운", blonde: "블론드", pink: "핑크",
  blue: "파란", purple: "보라", red: "레드", white: "화이트",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key") {
    return NextResponse.json(
      { success: false, error: "ANTHROPIC_API_KEY가 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  const { gender, skinTone, stylePreset, customPrompt, hairLength, hairColor } =
    await req.json();

  const genderKo = GENDER_KO[gender] || "여성";
  const styleDesc = STYLE_PROMPTS[stylePreset] || STYLE_PROMPTS.idol;
  const hairColorKo = HAIR_COLOR_KO[hairColor] || "";

  const systemPrompt = `당신은 K-pop 버추얼 아이돌 캐릭터 디자이너입니다.
주어진 옵션으로 상세한 버추얼 아이돌 캐릭터 묘사를 JSON 형태로 반환하세요.
반드시 아래 JSON 형식만 반환하고 다른 텍스트는 포함하지 마세요:
{
  "name": "캐릭터 이름 (영어+한글, 예: ARIA 아리아)",
  "concept": "핵심 컨셉 한 줄 (예: 빛의 여신, 어둠의 퀸)",
  "description": "외모 상세 묘사 2-3문장 (헤어, 눈, 의상, 분위기)",
  "personality": "성격 특징 2가지",
  "specialty": "특기 (예: 래핑, 댄스, 보컬)",
  "imagePrompt": "영어로 된 상세 이미지 생성 프롬프트 (Stable Diffusion 스타일)",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "styleKeywords": ["키워드1", "키워드2", "키워드3"]
}`;

  const userMessage = `다음 옵션으로 버추얼 아이돌을 만들어줘:
- 성별: ${genderKo}
- 헤어: ${hairColorKo} ${hairLength || "미디엄"} 헤어
- 스타일: ${styleDesc}
- 추가 묘사: ${customPrompt || "없음"}`;

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: userMessage }],
      system: systemPrompt,
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const characterData = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      data: {
        character: characterData,
        options: {
          gender,
          skinTone,
          stylePreset,
          hairColor,
          hairLength,
          customPrompt,
        },
      },
    });
  } catch (error) {
    console.error("[virtual/generate] failed:", error);
    return NextResponse.json(
      { success: false, error: "캐릭터 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
