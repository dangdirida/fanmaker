"use client";

interface Props {
  hairColor: string;
  hairLength: string;
  skinTone: string;
  eyeColor: string;
  outfitStyle: string;
  accessories: string[];
  gender: string;
}

const OUTFIT_COLORS: Record<string, string> = {
  stage: "#8B5CF6",
  casual: "#6B7280",
  uniform: "#1E40AF",
  training: "#059669",
  fantasy: "#EC4899",
  street: "#374151",
  hanbok: "#DC2626",
};

const HAIR_PATHS: Record<string, (c: string) => JSX.Element> = {
  short: (c) => (
    <path d="M28 30 C28 16 72 16 72 30 L72 38 C66 36 34 36 28 38Z" fill={c} />
  ),
  bob: (c) => (
    <>
      <path d="M28 30 C28 16 72 16 72 30 L72 38 C66 36 34 36 28 38Z" fill={c} />
      <rect x="26" y="36" width="10" height="18" rx="5" fill={c} opacity={0.85} />
      <rect x="64" y="36" width="10" height="18" rx="5" fill={c} opacity={0.85} />
    </>
  ),
  medium: (c) => (
    <>
      <path d="M28 30 C28 16 72 16 72 30 L72 38 C66 36 34 36 28 38Z" fill={c} />
      <rect x="24" y="36" width="11" height="30" rx="5" fill={c} opacity={0.8} />
      <rect x="65" y="36" width="11" height="30" rx="5" fill={c} opacity={0.8} />
    </>
  ),
  long: (c) => (
    <>
      <path d="M28 30 C28 16 72 16 72 30 L72 38 C66 36 34 36 28 38Z" fill={c} />
      <rect x="22" y="36" width="12" height="50" rx="6" fill={c} opacity={0.8} />
      <rect x="66" y="36" width="12" height="50" rx="6" fill={c} opacity={0.8} />
      <rect x="32" y="40" width="8" height="42" rx="4" fill={c} opacity={0.6} />
      <rect x="60" y="40" width="8" height="42" rx="4" fill={c} opacity={0.6} />
    </>
  ),
  twintail: (c) => (
    <>
      <path d="M28 30 C28 16 72 16 72 30 L72 38 C66 36 34 36 28 38Z" fill={c} />
      <ellipse cx="18" cy="60" rx="8" ry="20" fill={c} opacity={0.8} />
      <ellipse cx="82" cy="60" rx="8" ry="20" fill={c} opacity={0.8} />
    </>
  ),
  ponytail: (c) => (
    <>
      <path d="M28 30 C28 16 72 16 72 30 L72 38 C66 36 34 36 28 38Z" fill={c} />
      <ellipse cx="50" cy="18" rx="10" ry="6" fill={c} opacity={0.9} />
      <rect x="46" y="16" width="8" height="30" rx="4" fill={c} opacity={0.7} transform="rotate(-10 50 30)" />
    </>
  ),
  updo: (c) => (
    <>
      <path d="M28 30 C28 16 72 16 72 30 L72 38 C66 36 34 36 28 38Z" fill={c} />
      <ellipse cx="50" cy="16" rx="14" ry="10" fill={c} opacity={0.9} />
    </>
  ),
};

export default function CharacterSilhouette({
  hairColor, hairLength, skinTone, eyeColor, outfitStyle, accessories, gender,
}: Props) {
  const outfitColor = OUTFIT_COLORS[outfitStyle] || OUTFIT_COLORS.stage;
  const renderHair = HAIR_PATHS[hairLength] || HAIR_PATHS.medium;
  const mouthY = gender === "male" ? 50 : 49;

  return (
    <svg viewBox="0 0 100 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* 몸통 */}
      <ellipse cx="50" cy="115" rx="24" ry="30" fill={outfitColor} />
      {outfitStyle === "stage" && (
        <>
          <circle cx="38" cy="105" r="1.5" fill="white" opacity={0.6} />
          <circle cx="62" cy="108" r="1" fill="white" opacity={0.5} />
          <circle cx="50" cy="100" r="1.2" fill="white" opacity={0.7} />
        </>
      )}
      {outfitStyle === "uniform" && (
        <polygon points="48,95 52,95 51,108 49,108" fill="#DC2626" />
      )}

      {/* 목 */}
      <rect x="45" y="60" width="10" height="10" rx="3" fill={skinTone} />

      {/* 얼굴 */}
      <circle cx="50" cy="40" r="20" fill={skinTone} />

      {/* 헤어 */}
      {renderHair(hairColor)}

      {/* 눈 */}
      <ellipse cx="42" cy="40" rx="3.5" ry="3" fill="white" />
      <circle cx="42" cy="40" r="2.2" fill={eyeColor} />
      <circle cx="41" cy="39" r="0.8" fill="white" />
      <ellipse cx="58" cy="40" rx="3.5" ry="3" fill="white" />
      <circle cx="58" cy="40" r="2.2" fill={eyeColor} />
      <circle cx="57" cy="39" r="0.8" fill="white" />

      {/* 입 */}
      <path d={`M46 ${mouthY} Q50 ${mouthY + 3} 54 ${mouthY}`} fill="none" stroke="#E88B8B" strokeWidth="1.2" strokeLinecap="round" />

      {/* 볼터치 */}
      <circle cx="36" cy="45" r="3" fill="#FFB6C1" opacity={0.3} />
      <circle cx="64" cy="45" r="3" fill="#FFB6C1" opacity={0.3} />

      {/* 악세서리 */}
      {accessories.includes("왕관") && (
        <polygon points="38,15 42,8 46,14 50,6 54,14 58,8 62,15" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
      )}
      {accessories.includes("안경") && (
        <>
          <rect x="36" y="37" width="12" height="8" rx="3" fill="none" stroke="#333" strokeWidth="1" />
          <rect x="52" y="37" width="12" height="8" rx="3" fill="none" stroke="#333" strokeWidth="1" />
          <line x1="48" y1="41" x2="52" y2="41" stroke="#333" strokeWidth="0.8" />
        </>
      )}
      {accessories.includes("리본") && (
        <g transform="translate(62, 22) rotate(-15)">
          <polygon points="0,0 -6,-4 -6,4" fill="#FF69B4" />
          <polygon points="0,0 6,-4 6,4" fill="#FF69B4" />
          <circle cx="0" cy="0" r="1.5" fill="#FF1493" />
        </g>
      )}
      {accessories.includes("고양이귀") && (
        <>
          <polygon points="30,22 36,6 42,22" fill={hairColor} />
          <polygon points="33,20 36,10 39,20" fill="#FFB6C1" opacity={0.5} />
          <polygon points="58,22 64,6 70,22" fill={hairColor} />
          <polygon points="61,20 64,10 67,20" fill="#FFB6C1" opacity={0.5} />
        </>
      )}
      {accessories.includes("귀걸이") && (
        <>
          <circle cx="28" cy="48" r="2" fill="#FFD700" />
          <circle cx="72" cy="48" r="2" fill="#FFD700" />
        </>
      )}
    </svg>
  );
}
