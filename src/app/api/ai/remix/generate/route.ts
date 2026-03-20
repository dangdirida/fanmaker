import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const STYLE_LABELS: Record<string, string> = {
  "dance-pop": "댄스팝",
  acoustic: "어쿠스틱",
  synthwave: "신스웨이브",
  "lo-fi": "로파이 힙합",
  edm: "EDM",
  "r&b": "R&B",
  jazz: "재즈",
  tropical: "트로피컬 하우스",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const { style, bpm, key: keyShift, artistName } = await req.json();

  if (!style) {
    return NextResponse.json(
      { success: false, error: "스타일을 선택해주세요" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key") {
    return NextResponse.json(
      { success: false, error: "ANTHROPIC_API_KEY가 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  const styleLabel = STYLE_LABELS[style] || style;
  const keyText =
    keyShift === 0
      ? "원키 유지"
      : keyShift > 0
        ? `+${keyShift} 반음 올림`
        : `${keyShift} 반음 내림`;
  const artistText = artistName ? `${artistName}의 곡` : "K-pop 곡";

  const prompt = `당신은 K-pop 리믹스 전문 프로듀서입니다.

${artistText}을 "${styleLabel}" 스타일로 리믹스하려고 합니다.
BPM: ${bpm}, 키: ${keyText}

아래 항목을 한국어로 상세하고 창의적으로 작성해주세요:

1. **리믹스 컨셉** (3~4문장): 이 리믹스의 전체적인 방향성과 느낌
2. **편곡 방향** (4~5항목): 구체적인 편곡 변경 사항 (인트로, 벌스, 코러스, 브릿지, 아웃트로)
3. **추천 악기 & 사운드** (5~6개): 이 스타일에 어울리는 핵심 악기와 사운드 디자인
4. **예상 분위기 키워드** (5~6개): 한 단어로 표현하는 분위기 키워드
5. **프로듀서 코멘트** (2~3문장): 리믹스의 하이라이트 포인트와 리스너에게 전하는 말

각 섹션은 제목을 포함해서 마크다운 형식으로 작성해주세요.`;

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const resultText = textBlock?.text || "리믹스 컨셉 생성에 실패했습니다.";

    return NextResponse.json({
      success: true,
      data: {
        remixConcept: resultText,
        style: styleLabel,
        bpm,
        keyShift,
        artistName: artistName || null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 생성 중 오류가 발생했습니다";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
