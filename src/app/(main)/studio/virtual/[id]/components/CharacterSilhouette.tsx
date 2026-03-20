"use client";

import { useEffect, useState } from "react";

interface Props {
  hairColor: string;
  hairLength: string;
  skinTone: string;
  eyeColor: string;
  outfitStyle: string;
  accessories: string[];
  gender: string;
  stylePreset?: string;
}

const OUTFIT_CONFIGS: Record<string, { primary: string; secondary: string; accent: string }> = {
  stage:    { primary: "#7C3AED", secondary: "#A855F7", accent: "#F59E0B" },
  casual:   { primary: "#3B82F6", secondary: "#93C5FD", accent: "#FFFFFF" },
  uniform:  { primary: "#1E3A5F", secondary: "#FFFFFF", accent: "#DC2626" },
  training: { primary: "#065F46", secondary: "#34D399", accent: "#FFFFFF" },
  fantasy:  { primary: "#BE185D", secondary: "#F9A8D4", accent: "#FDE68A" },
  street:   { primary: "#111827", secondary: "#374151", accent: "#F59E0B" },
  hanbok:   { primary: "#DC2626", secondary: "#FEF3C7", accent: "#059669" },
};

function shade(color: string, pct: number): string {
  try {
    const n = parseInt(color.replace("#", ""), 16);
    const r = Math.min(255, Math.max(0, ((n >> 16) & 0xff) + Math.round(pct * 2.55)));
    const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + Math.round(pct * 2.55)));
    const b = Math.min(255, Math.max(0, (n & 0xff) + Math.round(pct * 2.55)));
    return `rgb(${r},${g},${b})`;
  } catch { return color; }
}

function Bangs({ color }: { color: string }) {
  const dk = shade(color, -30);
  const lt = shade(color, 45);
  return (
    <g>
      <path d="M60 65 C58 45 75 38 100 36 C125 38 142 45 140 65" fill={color} />
      <path d="M65 68 C68 50 80 42 95 40 C98 55 90 65 78 70Z" fill={dk} opacity="0.3" />
      <path d="M105 40 C120 42 132 50 135 68 C122 65 112 55 105 40Z" fill={dk} opacity="0.25" />
      <path d="M88 42 C92 40 100 40 105 43 C103 48 97 49 90 47Z" fill={lt} opacity="0.5" />
    </g>
  );
}

function Hair({ color, length }: { color: string; length: string }) {
  const dk = shade(color, -35);
  const lt = shade(color, 45);
  const bangs = <Bangs color={color} />;

  if (length === "short") return (
    <g>
      <path d="M55 75 C52 50 60 32 100 28 C140 32 148 50 145 75 C138 68 130 65 120 66 C115 62 112 60 100 60 C88 60 85 62 80 66 C70 65 62 68 55 75Z" fill={color} />
      {bangs}
      <path d="M55 75 C58 72 65 70 75 72 C72 80 66 85 58 88Z" fill={color} />
      <path d="M145 75 C142 72 135 70 125 72 C128 80 134 85 142 88Z" fill={color} />
      <path d="M65 50 C67 42 70 38 75 36 C73 42 70 50 68 58Z" fill={dk} opacity="0.2" />
    </g>
  );
  if (length === "bob") return (
    <g>
      <path d="M52 80 C50 52 58 30 100 26 C142 30 150 52 148 80 C142 85 130 88 118 86 C100 88 78 88 52 80Z" fill={color} />
      {bangs}
      <path d="M52 80 C48 88 46 96 48 104 C55 100 60 92 62 84Z" fill={color} />
      <path d="M148 80 C152 88 154 96 152 104 C145 100 140 92 138 84Z" fill={color} />
      <path d="M50 68 C52 58 56 50 62 44 C60 52 58 62 58 72Z" fill={dk} opacity="0.2" />
    </g>
  );
  if (length === "medium") return (
    <g>
      <path d="M50 78 C48 50 56 28 100 24 C144 28 152 50 150 78 C145 82 138 86 100 90 C62 86 55 82 50 78Z" fill={color} />
      {bangs}
      <path d="M50 78 C44 90 40 108 42 126 C50 118 56 104 58 88Z" fill={color} />
      <path d="M150 78 C156 90 160 108 158 126 C150 118 144 104 142 88Z" fill={color} />
      <path d="M68 88 C64 100 62 115 64 128 C70 118 72 105 72 90Z" fill={color} opacity="0.85" />
      <path d="M132 88 C136 100 138 115 136 128 C130 118 128 105 128 90Z" fill={color} opacity="0.85" />
      <path d="M52 72 C54 60 58 50 64 42 C62 52 60 64 60 76Z" fill={dk} opacity="0.18" />
    </g>
  );
  if (length === "long") return (
    <g>
      <path d="M48 76 C46 48 54 26 100 22 C146 26 154 48 152 76 C148 82 140 86 100 92 C60 86 52 82 48 76Z" fill={color} />
      {bangs}
      <path d="M48 76 C40 96 36 120 38 150 C48 136 54 112 56 86Z" fill={color} />
      <path d="M152 76 C160 96 164 120 162 150 C152 136 146 112 144 86Z" fill={color} />
      <path d="M62 90 C56 108 54 130 56 155 C64 138 68 116 68 90Z" fill={color} opacity="0.85" />
      <path d="M138 90 C144 108 146 130 144 155 C136 138 132 116 132 90Z" fill={color} opacity="0.85" />
      <path d="M75 92 C72 110 72 130 74 155 C80 138 82 116 80 92Z" fill={dk} opacity="0.3" />
      <path d="M44 85 C42 100 42 118 44 136 C46 120 46 102 46 85Z" fill={lt} opacity="0.25" />
    </g>
  );
  if (length === "twintail") return (
    <g>
      <path d="M55 72 C53 48 60 28 100 24 C140 28 147 48 145 72 C140 76 130 78 100 77 C70 76 60 76 55 72Z" fill={color} />
      {bangs}
      <circle cx="68" cy="72" r="6" fill={dk} opacity="0.6" />
      <circle cx="132" cy="72" r="6" fill={dk} opacity="0.6" />
      <path d="M62 78 C52 95 44 115 48 140 C56 122 62 100 64 78Z" fill={color} />
      <path d="M138 78 C148 95 156 115 152 140 C144 122 138 100 136 78Z" fill={color} />
      <path d="M50 95 C46 108 46 122 50 138 C56 124 58 108 56 92Z" fill={dk} opacity="0.2" />
      <path d="M150 95 C154 108 154 122 150 138 C144 124 142 108 144 92Z" fill={dk} opacity="0.2" />
    </g>
  );
  if (length === "ponytail") return (
    <g>
      <path d="M55 72 C53 48 60 28 100 24 C140 28 147 48 145 72" fill={color} />
      {bangs}
      <ellipse cx="100" cy="28" rx="18" ry="10" fill={color} />
      <circle cx="100" cy="28" r="5" fill={dk} opacity="0.5" />
      <path d="M92 30 C88 50 86 80 88 110 C96 90 100 65 100 35Z" fill={color} />
      <path d="M108 30 C112 50 114 80 112 110 C104 90 100 65 100 35Z" fill={color} />
      <path d="M96 35 C94 58 94 82 96 108 C100 86 100 60 100 38Z" fill={dk} opacity="0.2" />
      <path d="M55 72 C50 80 48 90 50 100 C56 90 58 80 58 70Z" fill={color} />
      <path d="M145 72 C150 80 152 90 150 100 C144 90 142 80 142 70Z" fill={color} />
    </g>
  );
  // updo
  return (
    <g>
      <path d="M55 72 C53 48 60 28 100 24 C140 28 147 48 145 72 C138 76 125 78 100 78 C75 78 62 76 55 72Z" fill={color} />
      {bangs}
      <ellipse cx="100" cy="22" rx="22" ry="16" fill={color} />
      <ellipse cx="100" cy="20" rx="18" ry="12" fill={lt} opacity="0.3" />
      <path d="M85 18 C88 12 95 10 105 12 C115 14 118 20 115 26" fill="none" stroke={dk} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <rect x="88" y="12" width="24" height="3" rx="1.5" fill="#FFD700" transform="rotate(-15 100 14)" />
      <path d="M55 70 C50 78 50 88 54 96 C60 86 62 76 60 68Z" fill={color} opacity="0.85" />
      <path d="M145 70 C150 78 150 88 146 96 C140 86 138 76 140 68Z" fill={color} opacity="0.85" />
    </g>
  );
}

function Outfit({ style, p, s, a }: { style: string; p: string; s: string; a: string }) {
  const dk = shade(p, -15);
  if (style === "stage") return (
    <g>
      <path d="M62 168 C55 175 50 190 52 220 L148 220 C150 190 145 175 138 168 L120 162 L100 165 L80 162Z" fill={p} />
      <path d="M62 168 C70 163 80 160 100 160 C120 160 130 163 138 168" fill="none" stroke={s} strokeWidth="3" opacity="0.6" />
      {[{x:100,y:178,r:3},{x:90,y:185,r:2},{x:110,y:182,r:2.5},{x:85,y:195,r:1.5},{x:115,y:193,r:2}].map((d,i)=>(
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={a} opacity={0.9-i*0.08} />
      ))}
      <path d="M62 168 C50 172 42 185 40 200 C48 198 56 190 60 178Z" fill={p} />
      <path d="M138 168 C150 172 158 185 160 200 C152 198 144 190 140 178Z" fill={p} />
      <path d="M75 170 L100 190 L125 170" fill="none" stroke={a} strokeWidth="1" opacity="0.5" />
    </g>
  );
  if (style === "uniform") return (
    <g>
      <path d="M65 168 C58 175 54 192 56 220 L144 220 C146 192 142 175 135 168 L118 162 L100 164 L82 162Z" fill={p} />
      <path d="M85 160 L100 175 L115 160" fill={s} stroke="#DDD" strokeWidth="1" />
      <polygon points="97,165 103,165 101,195 99,195" fill={a} />
      <polygon points="96,168 104,168 103,173 97,173" fill={a} />
      <line x1="97" y1="165" x2="95" y2="220" stroke={dk} strokeWidth="2" />
      <line x1="103" y1="165" x2="105" y2="220" stroke={dk} strokeWidth="2" />
      <path d="M65 168 C54 173 46 186 44 202 C52 200 60 192 62 178Z" fill={p} />
      <path d="M135 168 C146 173 154 186 156 202 C148 200 140 192 138 178Z" fill={p} />
    </g>
  );
  if (style === "fantasy") return (
    <g>
      <path d="M60 168 C53 175 50 192 52 220 L148 220 C150 192 147 175 140 168 L122 160 L100 163 L78 160Z" fill={p} />
      <path d="M78 160 C84 155 92 152 100 152 C108 152 116 155 122 160" fill="none" stroke={s} strokeWidth="2" opacity="0.8" />
      {[85,100,115,90,110].map((x,i)=>(
        <polygon key={i} points={`${x},${175+i*8} ${x+3},${170+i*8} ${x+6},${175+i*8} ${x+4},${180+i*8} ${x+2},${178+i*8}`} fill={a} opacity="0.8" />
      ))}
      <path d="M60 168 C45 178 38 200 42 218 C52 208 58 190 62 172Z" fill={dk} opacity="0.9" />
      <path d="M140 168 C155 178 162 200 158 218 C148 208 142 190 138 172Z" fill={dk} opacity="0.9" />
    </g>
  );
  if (style === "hanbok") return (
    <g>
      <path d="M68 168 C62 176 60 194 62 220 L138 220 C140 194 138 176 132 168 L118 162 L100 164 L82 162Z" fill={p} />
      <path d="M88 162 L100 175 L112 162" fill="white" opacity="0.9" />
      <path d="M100 175 C95 180 90 185 85 195" fill="none" stroke={a} strokeWidth="3" strokeLinecap="round" />
      <path d="M100 175 C105 182 102 192 98 200" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" />
      <path d="M68 168 C58 173 52 186 54 204 C62 200 66 186 68 170Z" fill={p} />
      <path d="M132 168 C142 173 148 186 146 204 C138 200 134 186 132 170Z" fill={p} />
    </g>
  );
  if (style === "street") return (
    <g>
      <path d="M58 168 C50 176 46 196 48 220 L152 220 C154 196 150 176 142 168 L124 160 L100 163 L76 160Z" fill={p} />
      <rect x="82" y="192" width="36" height="22" rx="4" fill={dk} />
      <rect x="78" y="163" width="6" height="60" rx="3" fill={s} opacity="0.5" />
      <rect x="116" y="163" width="6" height="60" rx="3" fill={s} opacity="0.5" />
      <path d="M58 168 C42 175 34 198 38 218 C50 210 56 192 60 172Z" fill={p} />
      <path d="M142 168 C158 175 166 198 162 218 C150 210 144 192 140 172Z" fill={p} />
    </g>
  );
  if (style === "training") return (
    <g>
      <path d="M65 168 C58 176 55 194 57 220 L143 220 C145 194 142 176 135 168 L118 163 L100 165 L82 163Z" fill={p} />
      <path d="M65 168 C68 175 70 190 70 220" fill="none" stroke={s} strokeWidth="3" opacity="0.7" />
      <path d="M135 168 C132 175 130 190 130 220" fill="none" stroke={s} strokeWidth="3" opacity="0.7" />
      <line x1="100" y1="163" x2="100" y2="200" stroke={dk} strokeWidth="2" strokeDasharray="3,2" />
      <path d="M75 168 C72 158 74 148 100 145 C126 148 128 158 125 168" fill={p} opacity="0.9" />
      <path d="M65 168 C53 173 46 188 48 206 C56 202 62 188 64 172Z" fill={p} />
      <path d="M135 168 C147 173 154 188 152 206 C144 202 138 188 136 172Z" fill={p} />
    </g>
  );
  // casual
  return (
    <g>
      <path d="M65 168 C58 175 55 192 57 220 L143 220 C145 192 142 175 135 168 L118 163 L100 165 L82 163Z" fill={p} />
      <path d="M82 163 L100 168 L118 163" fill="none" stroke={dk} strokeWidth="2" />
      <path d="M65 168 C57 174 52 185 54 196 C62 193 66 182 66 170Z" fill={p} />
      <path d="M135 168 C143 174 148 185 146 196 C138 193 134 182 134 170Z" fill={p} />
      <text x="100" y="195" textAnchor="middle" fontSize="14" fill={s} opacity="0.7">&#9733;</text>
    </g>
  );
}

export default function CharacterSilhouette({
  hairColor, hairLength, skinTone, eyeColor, outfitStyle, accessories, gender,
}: Props) {
  const [blink, setBlink] = useState(false);
  const [breathe, setBreathe] = useState(0);

  const outfit = OUTFIT_CONFIGS[outfitStyle] || OUTFIT_CONFIGS.stage;
  const skinShadow = shade(skinTone, -20);
  const skinHi = shade(skinTone, 25);
  const hairDk = shade(hairColor, -35);

  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, Math.random() * 2000 + 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let frame: number;
    let t = 0;
    const run = () => { t += 0.02; setBreathe(Math.sin(t) * 2); frame = requestAnimationFrame(run); };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, []);

  const eyeY = blink ? 0.08 : 1;

  return (
    <svg viewBox="0 0 200 320" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fg" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={skinHi} />
          <stop offset="60%" stopColor={skinTone} />
          <stop offset="100%" stopColor={skinShadow} />
        </radialGradient>
        <radialGradient id="eg" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={shade(eyeColor, 50)} />
          <stop offset="50%" stopColor={eyeColor} />
          <stop offset="100%" stopColor={shade(eyeColor, -40)} />
        </radialGradient>
      </defs>

      <g transform={`translate(0,${breathe * 0.5})`}>
        {/* 의상 */}
        <Outfit style={outfitStyle} p={outfit.primary} s={outfit.secondary} a={outfit.accent} />

        {/* 목 + 쇄골 */}
        <ellipse cx="100" cy="150" rx="14" ry="8" fill={skinTone} />
        <path d="M88 148 C90 155 95 160 100 162 C105 160 110 155 112 148" fill={skinTone} />
        <path d="M72 158 C82 153 90 150 100 150" fill="none" stroke={skinShadow} strokeWidth="1" opacity="0.3" />
        <path d="M128 158 C118 153 110 150 100 150" fill="none" stroke={skinShadow} strokeWidth="1" opacity="0.3" />

        {/* 얼굴 */}
        <g transform={`translate(0,${breathe * 0.3})`}>
          <ellipse cx="100" cy="100" rx="42" ry="48" fill="url(#fg)" />
          <ellipse cx="100" cy="140" rx="30" ry="10" fill={skinShadow} opacity="0.15" />
          <ellipse cx="78" cy="110" rx="10" ry="7" fill="#FFB6C1" opacity="0.25" />
          <ellipse cx="122" cy="110" rx="10" ry="7" fill="#FFB6C1" opacity="0.25" />
          {/* 코 */}
          <path d="M96 108 C96 112 98 115 100 116 C102 115 104 112 104 108" fill="none" stroke={skinShadow} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />

          {/* 눈썹 */}
          {gender === "male" ? (
            <>
              <path d="M76 84 C81 81 88 80 94 82" fill="none" stroke={hairDk} strokeWidth="3" strokeLinecap="round" />
              <path d="M106 82 C112 80 119 81 124 84" fill="none" stroke={hairDk} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M78 84 C82 81 88 80 94 81" fill="none" stroke={hairDk} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M106 81 C112 80 118 81 122 84" fill="none" stroke={hairDk} strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}

          {/* 왼눈 */}
          <g transform={`translate(86,96) scale(1,${eyeY})`}>
            <ellipse cx="0" cy="0" rx="10" ry="8" fill="white" />
            <circle cx="1" cy="1" r="6.5" fill="url(#eg)" />
            <circle cx="1" cy="1" r="3.5" fill="#0a0a0a" />
            <circle cx="-2" cy="-2" r="2.2" fill="white" opacity="0.9" />
            <circle cx="3" cy="-1" r="1" fill="white" opacity="0.6" />
            <path d="M-10 -6 C-5 -10 5 -10 10 -6" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-9" y1="-5" x2="-12" y2="-9" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="-5" x2="12" y2="-9" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M-8 6 C-2 8 2 8 8 6" fill="none" stroke={skinShadow} strokeWidth="1" opacity="0.5" />
          </g>
          {/* 오른눈 */}
          <g transform={`translate(114,96) scale(1,${eyeY})`}>
            <ellipse cx="0" cy="0" rx="10" ry="8" fill="white" />
            <circle cx="-1" cy="1" r="6.5" fill="url(#eg)" />
            <circle cx="-1" cy="1" r="3.5" fill="#0a0a0a" />
            <circle cx="-4" cy="-2" r="2.2" fill="white" opacity="0.9" />
            <circle cx="1" cy="-1" r="1" fill="white" opacity="0.6" />
            <path d="M-10 -6 C-5 -10 5 -10 10 -6" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-9" y1="-5" x2="-12" y2="-9" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="-5" x2="12" y2="-9" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M-8 6 C-2 8 2 8 8 6" fill="none" stroke={skinShadow} strokeWidth="1" opacity="0.5" />
          </g>

          {/* 입 */}
          {gender === "female" ? (
            <g transform="translate(100,122)">
              <path d="M-10 0 C-6 -4 -2 -5 0 -4 C2 -5 6 -4 10 0" fill="#E88B8B" opacity="0.9" />
              <path d="M-10 0 C-6 5 6 5 10 0" fill="#F2A5A5" />
              <ellipse cx="0" cy="2" rx="4" ry="1.5" fill="white" opacity="0.3" />
              <path d="M-10 0 C-4 1 4 1 10 0" fill="none" stroke="#C07070" strokeWidth="0.8" />
            </g>
          ) : (
            <g transform="translate(100,122)">
              <path d="M-9 0 C-5 -3 5 -3 9 0 C5 4 -5 4 -9 0Z" fill="#C08080" opacity="0.8" />
              <path d="M-9 0 C-5 1 5 1 9 0" fill="none" stroke="#A06060" strokeWidth="1" />
            </g>
          )}
        </g>

        {/* 헤어 (얼굴 위) */}
        <Hair color={hairColor} length={hairLength} />

        {/* 악세서리 */}
        {accessories.includes("왕관") && (
          <g transform="translate(100,52)">
            <path d="M-22 0 L-15 -14 L-8 -2 L0 -18 L8 -2 L15 -14 L22 0Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
            <circle cx="-15" cy="-12" r="2.5" fill="#FF4444" />
            <circle cx="0" cy="-16" r="3" fill="#4444FF" />
            <circle cx="15" cy="-12" r="2.5" fill="#44FF44" />
          </g>
        )}
        {accessories.includes("안경") && (
          <g transform="translate(100,96)" opacity="0.85">
            <rect x="-26" y="-10" width="20" height="16" rx="4" fill="none" stroke="#2a2a2a" strokeWidth="2" />
            <rect x="6" y="-10" width="20" height="16" rx="4" fill="none" stroke="#2a2a2a" strokeWidth="2" />
            <line x1="-6" y1="-3" x2="6" y2="-3" stroke="#2a2a2a" strokeWidth="2" />
          </g>
        )}
        {accessories.includes("리본") && (
          <g transform="translate(130,68) rotate(-15)">
            <path d="M0 0 L-12 -8 L-12 8Z" fill="#FF69B4" />
            <path d="M0 0 L12 -8 L12 8Z" fill="#FF1493" />
            <circle cx="0" cy="0" r="4" fill="#FFB6C1" />
          </g>
        )}
        {accessories.includes("고양이귀") && (
          <g>
            <path d="M66 66 L72 42 L84 62" fill={hairColor} />
            <path d="M69 64 L74 46 L81 62" fill="#FFB6C1" opacity="0.6" />
            <path d="M116 62 L128 42 L134 66" fill={hairColor} />
            <path d="M119 62 L126 46 L131 64" fill="#FFB6C1" opacity="0.6" />
          </g>
        )}
        {accessories.includes("귀걸이") && (
          <g>
            <circle cx="58" cy="118" r="4" fill="#FFD700" />
            <line x1="58" y1="122" x2="58" y2="134" stroke="#FFD700" strokeWidth="2" />
            <circle cx="58" cy="136" r="3" fill="#FFD700" />
            <circle cx="142" cy="118" r="4" fill="#FFD700" />
            <line x1="142" y1="122" x2="142" y2="134" stroke="#FFD700" strokeWidth="2" />
            <circle cx="142" cy="136" r="3" fill="#FFD700" />
          </g>
        )}
        {accessories.includes("목걸이") && (
          <path d="M82 155 C88 160 94 163 100 164 C106 163 112 160 118 155" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        )}
        {accessories.includes("마스크") && (
          <rect x="78" y="108" width="44" height="30" rx="8" fill="white" opacity="0.9" stroke="#ddd" strokeWidth="1" />
        )}
        {accessories.includes("헤어핀") && (
          <g transform="translate(130,82) rotate(30)">
            <rect x="-1" y="-12" width="2" height="24" rx="1" fill="#FF69B4" />
            <ellipse cx="0" cy="-14" rx="5" ry="4" fill="#FF1493" />
          </g>
        )}
        {accessories.includes("날개") && (
          <g opacity="0.6">
            <path d="M40 175 C20 160 10 140 15 120 C25 135 35 155 50 168Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
            <path d="M35 180 C12 168 2 148 8 128 C20 145 30 162 45 175Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
            <path d="M160 175 C180 160 190 140 185 120 C175 135 165 155 150 168Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
            <path d="M165 180 C188 168 198 148 192 128 C180 145 170 162 155 175Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
          </g>
        )}
      </g>
    </svg>
  );
}
