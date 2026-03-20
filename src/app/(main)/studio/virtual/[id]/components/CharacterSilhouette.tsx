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

const OUTFIT_CFG: Record<string, { p: string; s: string; a: string }> = {
  stage:    { p: "#7C3AED", s: "#A855F7", a: "#F59E0B" },
  casual:   { p: "#3B82F6", s: "#93C5FD", a: "#FFFFFF" },
  uniform:  { p: "#1E3A5F", s: "#FFFFFF", a: "#DC2626" },
  training: { p: "#065F46", s: "#34D399", a: "#FFFFFF" },
  fantasy:  { p: "#BE185D", s: "#F9A8D4", a: "#FDE68A" },
  street:   { p: "#1F2937", s: "#4B5563", a: "#F59E0B" },
  hanbok:   { p: "#DC2626", s: "#FEF3C7", a: "#059669" },
};

function sh(color: string, pct: number): string {
  try {
    const n = parseInt(color.replace("#", ""), 16);
    const r = Math.min(255, Math.max(0, ((n >> 16) & 0xff) + Math.round(pct * 2.55)));
    const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + Math.round(pct * 2.55)));
    const b = Math.min(255, Math.max(0, (n & 0xff) + Math.round(pct * 2.55)));
    return `rgb(${r},${g},${b})`;
  } catch { return color; }
}

function HairSVG({ c, length }: { c: string; length: string }) {
  const dk = sh(c, -30);
  const lt = sh(c, 40);
  // 공통 앞머리
  const bangs = (
    <g>
      <path d="M108 55 C108 40 120 32 150 30 C180 32 192 40 192 55" fill={c} />
      <path d="M112 58 C115 42 128 36 145 34 C142 48 135 56 125 60Z" fill={dk} opacity="0.25" />
      <path d="M155 34 C172 36 185 42 188 58 C178 56 168 48 158 36Z" fill={dk} opacity="0.2" />
      <path d="M138 35 C142 33 150 33 156 36 C154 40 146 41 140 39Z" fill={lt} opacity="0.45" />
    </g>
  );
  if (length === "short") return (
    <g>
      <path d="M105 62 C102 42 112 24 150 20 C188 24 198 42 195 62 C188 56 178 54 168 55 C162 50 156 48 150 48 C144 48 138 50 132 55 C122 54 112 56 105 62Z" fill={c} />
      {bangs}
      <path d="M105 62 C108 60 115 58 124 60 C120 68 114 72 108 74Z" fill={c} />
      <path d="M195 62 C192 60 185 58 176 60 C180 68 186 72 192 74Z" fill={c} />
    </g>
  );
  if (length === "bob") return (
    <g>
      <path d="M102 66 C100 42 110 22 150 18 C190 22 200 42 198 66 C192 70 180 74 166 72 C150 74 134 74 102 66Z" fill={c} />
      {bangs}
      <path d="M102 66 C98 76 96 86 98 96 C106 90 110 80 112 70Z" fill={c} />
      <path d="M198 66 C202 76 204 86 202 96 C194 90 190 80 188 70Z" fill={c} />
    </g>
  );
  if (length === "medium") return (
    <g>
      <path d="M100 64 C98 40 108 20 150 16 C192 20 202 40 200 64 C196 68 186 72 150 76 C114 72 104 68 100 64Z" fill={c} />
      {bangs}
      <path d="M100 64 C94 78 90 96 92 116 C100 106 106 90 108 74Z" fill={c} />
      <path d="M200 64 C206 78 210 96 208 116 C200 106 194 90 192 74Z" fill={c} />
      <path d="M118 74 C114 88 112 104 114 118 C120 106 122 92 122 76Z" fill={c} opacity="0.85" />
      <path d="M182 74 C186 88 188 104 186 118 C180 106 178 92 178 76Z" fill={c} opacity="0.85" />
    </g>
  );
  if (length === "long") return (
    <g>
      <path d="M98 62 C96 38 106 18 150 14 C194 18 204 38 202 62 C198 66 188 70 150 74 C112 70 102 66 98 62Z" fill={c} />
      {bangs}
      <path d="M98 62 C88 82 84 110 86 145 C96 128 102 102 106 72Z" fill={c} />
      <path d="M202 62 C212 82 216 110 214 145 C204 128 198 102 194 72Z" fill={c} />
      <path d="M112 74 C106 94 104 118 106 148 C114 130 118 108 118 76Z" fill={c} opacity="0.85" />
      <path d="M188 74 C194 94 196 118 194 148 C186 130 182 108 182 76Z" fill={c} opacity="0.85" />
      <path d="M125 76 C122 96 122 120 124 150 C130 130 132 108 130 78Z" fill={dk} opacity="0.25" />
      <path d="M92 70 C90 88 90 108 92 128 C94 110 94 90 94 72Z" fill={lt} opacity="0.2" />
    </g>
  );
  if (length === "twintail") return (
    <g>
      <path d="M106 58 C104 38 112 20 150 16 C188 20 196 38 194 58 C190 62 178 64 150 64 C122 64 110 62 106 58Z" fill={c} />
      {bangs}
      <circle cx="118" cy="58" r="6" fill={dk} opacity="0.5" />
      <circle cx="182" cy="58" r="6" fill={dk} opacity="0.5" />
      <path d="M112 64 C100 82 92 108 96 140 C106 120 112 96 114 66Z" fill={c} />
      <path d="M188 64 C200 82 208 108 204 140 C194 120 188 96 186 66Z" fill={c} />
      <path d="M98 88 C94 102 94 118 98 136 C104 120 106 104 104 86Z" fill={dk} opacity="0.2" />
      <path d="M202 88 C206 102 206 118 202 136 C196 120 194 104 196 86Z" fill={dk} opacity="0.2" />
    </g>
  );
  if (length === "ponytail") return (
    <g>
      <path d="M106 58 C104 38 112 20 150 16 C188 20 196 38 194 58" fill={c} />
      {bangs}
      <ellipse cx="150" cy="22" rx="16" ry="10" fill={c} />
      <circle cx="150" cy="22" r="5" fill={dk} opacity="0.4" />
      <path d="M142 24 C138 44 136 70 138 100 C146 80 150 55 150 28Z" fill={c} />
      <path d="M158 24 C162 44 164 70 162 100 C154 80 150 55 150 28Z" fill={c} />
      <path d="M106 58 C100 66 98 76 100 86 C106 78 108 68 108 56Z" fill={c} />
      <path d="M194 58 C200 66 202 76 200 86 C194 78 192 68 192 56Z" fill={c} />
    </g>
  );
  // updo
  return (
    <g>
      <path d="M106 58 C104 38 112 20 150 16 C188 20 196 38 194 58 C188 62 175 64 150 64 C125 64 112 62 106 58Z" fill={c} />
      {bangs}
      <ellipse cx="150" cy="16" rx="20" ry="14" fill={c} />
      <ellipse cx="150" cy="14" rx="16" ry="10" fill={lt} opacity="0.3" />
      <path d="M136 12 C140 6 148 4 160 6 C168 8 172 14 168 20" fill="none" stroke={dk} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <rect x="140" y="6" width="20" height="3" rx="1.5" fill="#FFD700" transform="rotate(-12 150 8)" />
      <path d="M106 56 C100 64 100 74 104 82 C110 74 112 64 110 54Z" fill={c} opacity="0.85" />
      <path d="M194 56 C200 64 200 74 196 82 C190 74 188 64 190 54Z" fill={c} opacity="0.85" />
    </g>
  );
}

function OutfitSVG({ style, p, s, a }: { style: string; p: string; s: string; a: string }) {
  const dk = sh(p, -20);
  // 공통 다리+신발 (의상 뒤에 깔림)
  const legs = (skinC: string) => (
    <g>
      <rect x="126" y="340" width="18" height="110" rx="8" fill={skinC} />
      <rect x="156" y="340" width="18" height="110" rx="8" fill={skinC} />
      <ellipse cx="135" cy="452" rx="14" ry="6" fill="#1a1a1a" />
      <ellipse cx="165" cy="452" rx="14" ry="6" fill="#1a1a1a" />
    </g>
  );

  if (style === "stage") return (
    <g>
      {legs("#0000")}
      {/* 스커트 */}
      <path d="M110 235 C105 270 100 310 95 345 L205 345 C200 310 195 270 190 235Z" fill={p} />
      <path d="M115 240 C112 265 108 295 105 330" fill="none" stroke={sh(p, 15)} strokeWidth="2" opacity="0.4" />
      {/* 다리 */}
      <rect x="126" y="335" width="18" height="115" rx="8" fill="#F5C5A3" />
      <rect x="156" y="335" width="18" height="115" rx="8" fill="#F5C5A3" />
      <ellipse cx="135" cy="452" rx="14" ry="6" fill="#1a1a1a" />
      <ellipse cx="165" cy="452" rx="14" ry="6" fill="#1a1a1a" />
      {/* 상의 */}
      <path d="M108 130 C95 135 85 145 82 160 L82 235 L218 235 L218 160 C215 145 205 135 192 130 L175 125 L150 128 L125 125Z" fill={p} />
      <path d="M108 130 C118 125 130 122 150 122 C170 122 182 125 192 130" fill="none" stroke={s} strokeWidth="3" opacity="0.5" />
      {/* 장식 */}
      {[{x:150,y:155,r:3.5},{x:140,y:168,r:2.5},{x:160,y:165,r:3},{x:135,y:182,r:2},{x:165,y:180,r:2.5},{x:150,y:195,r:2}].map((d,i)=>(
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={a} opacity={0.85-i*0.08} />
      ))}
      {/* 팔 */}
      <path d="M108 130 C92 138 80 155 76 180 L76 230 C82 228 88 218 90 200 L95 160 Z" fill={p} />
      <path d="M192 130 C208 138 220 155 224 180 L224 230 C218 228 212 218 210 200 L205 160 Z" fill={p} />
      {/* 손 */}
      <ellipse cx="76" cy="234" rx="8" ry="10" fill="#F5C5A3" />
      <ellipse cx="224" cy="234" rx="8" ry="10" fill="#F5C5A3" />
    </g>
  );

  if (style === "uniform") return (
    <g>
      {/* 스커트 */}
      <path d="M115 235 C112 265 108 300 105 340 L195 340 C192 300 188 265 185 235Z" fill={dk} />
      {/* 다리 */}
      <rect x="126" y="332" width="18" height="118" rx="8" fill="#F5C5A3" />
      <rect x="156" y="332" width="18" height="118" rx="8" fill="#F5C5A3" />
      <ellipse cx="135" cy="452" rx="14" ry="6" fill="#2a2a2a" />
      <ellipse cx="165" cy="452" rx="14" ry="6" fill="#2a2a2a" />
      {/* 재킷 */}
      <path d="M108 130 C95 135 85 148 82 165 L82 235 L218 235 L218 165 C215 148 205 135 192 130 L175 125 L150 128 L125 125Z" fill={p} />
      {/* 칼라+셔츠 */}
      <path d="M130 122 L150 140 L170 122" fill={s} stroke="#DDD" strokeWidth="1" />
      {/* 넥타이 */}
      <polygon points="147,130 153,130 151,175 149,175" fill={a} />
      <polygon points="146,133 154,133 153,138 147,138" fill={a} />
      {/* 라인 */}
      <line x1="148" y1="130" x2="146" y2="235" stroke={dk} strokeWidth="2" />
      <line x1="152" y1="130" x2="154" y2="235" stroke={dk} strokeWidth="2" />
      {/* 팔 */}
      <path d="M108 130 C92 138 82 155 78 178 L78 228 C84 226 90 216 92 198 L96 158Z" fill={p} />
      <path d="M192 130 C208 138 218 155 222 178 L222 228 C216 226 210 216 208 198 L204 158Z" fill={p} />
      <ellipse cx="78" cy="232" rx="8" ry="10" fill="#F5C5A3" />
      <ellipse cx="222" cy="232" rx="8" ry="10" fill="#F5C5A3" />
    </g>
  );

  if (style === "fantasy") return (
    <g>
      {/* 드레스 플레어 */}
      <path d="M105 230 C95 280 85 330 80 380 L220 380 C215 330 205 280 195 230Z" fill={p} />
      <path d="M110 235 C106 265 100 305 96 350" fill="none" stroke={s} strokeWidth="2" opacity="0.4" />
      <path d="M190 235 C194 265 200 305 204 350" fill="none" stroke={s} strokeWidth="2" opacity="0.4" />
      {/* 신발 */}
      <ellipse cx="110" cy="382" rx="16" ry="5" fill={dk} />
      <ellipse cx="190" cy="382" rx="16" ry="5" fill={dk} />
      {/* 코르셋 상의 */}
      <path d="M108 130 C95 135 86 148 84 165 L84 230 L216 230 L216 165 C214 148 205 135 192 130 L172 122 L150 125 L128 122Z" fill={p} />
      <path d="M128 122 C136 118 142 116 150 116 C158 116 164 118 172 122" fill="none" stroke={s} strokeWidth="2" opacity="0.7" />
      {/* 별 장식 */}
      {[{x:140,y:155},{x:160,y:160},{x:150,y:180},{x:135,y:195},{x:165,y:190}].map((d,i)=>(
        <polygon key={i} points={`${d.x},${d.y-5} ${d.x+2},${d.y-1} ${d.x+5},${d.y} ${d.x+2},${d.y+1} ${d.x+3},${d.y+5} ${d.x},${d.y+2} ${d.x-3},${d.y+5} ${d.x-2},${d.y+1} ${d.x-5},${d.y} ${d.x-2},${d.y-1}`} fill={a} opacity="0.75" />
      ))}
      {/* 케이프 소매 */}
      <path d="M108 130 C88 142 76 165 74 195 L74 240 C82 236 88 220 92 198Z" fill={sh(p,-12)} opacity="0.9" />
      <path d="M192 130 C212 142 224 165 226 195 L226 240 C218 236 212 220 208 198Z" fill={sh(p,-12)} opacity="0.9" />
      <ellipse cx="74" cy="244" rx="8" ry="10" fill="#F5C5A3" />
      <ellipse cx="226" cy="244" rx="8" ry="10" fill="#F5C5A3" />
    </g>
  );

  if (style === "street") return (
    <g>
      {/* 바지 */}
      <path d="M115 235 L110 370 L145 370 L150 260 L155 370 L190 370 L185 235Z" fill={s} />
      <ellipse cx="128" cy="372" rx="16" ry="6" fill="#F5F5F5" />
      <ellipse cx="172" cy="372" rx="16" ry="6" fill="#F5F5F5" />
      {/* 오버핏 후디 */}
      <path d="M100 130 C85 138 75 155 72 178 L72 240 L228 240 L228 178 C225 155 215 138 200 130 L178 122 L150 125 L122 122Z" fill={p} />
      {/* 포켓 */}
      <rect x="130" y="196" width="40" height="28" rx="4" fill={dk} />
      {/* 후드 뒤 */}
      <path d="M122 130 C118 118 120 108 150 104 C180 108 182 118 178 130" fill={p} opacity="0.9" />
      {/* 팔 - 오버핏 */}
      <path d="M100 130 C78 142 66 168 68 200 L68 240 C78 236 84 218 88 196Z" fill={p} />
      <path d="M200 130 C222 142 234 168 232 200 L232 240 C222 236 216 218 212 196Z" fill={p} />
      <ellipse cx="68" cy="244" rx="9" ry="11" fill="#F5C5A3" />
      <ellipse cx="232" cy="244" rx="9" ry="11" fill="#F5C5A3" />
    </g>
  );

  if (style === "hanbok") return (
    <g>
      {/* 치마 */}
      <path d="M108 225 C100 270 92 320 88 375 L212 375 C208 320 200 270 192 225Z" fill={p} />
      <path d="M115 228 C112 258 106 300 102 345" fill="none" stroke={sh(p, 20)} strokeWidth="2" opacity="0.3" />
      <ellipse cx="110" cy="377" rx="14" ry="5" fill={dk} />
      <ellipse cx="190" cy="377" rx="14" ry="5" fill={dk} />
      {/* 저고리 */}
      <path d="M112 130 C98 136 90 150 88 168 L88 225 L212 225 L212 168 C210 150 202 136 188 130 L172 125 L150 128 L128 125Z" fill={s} />
      {/* 동정 */}
      <path d="M135 125 L150 142 L165 125" fill="white" opacity="0.9" />
      {/* 고름 */}
      <path d="M150 142 C145 150 138 158 132 170" fill="none" stroke={a} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M150 142 C155 152 152 165 148 175" fill="none" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
      {/* 소매 */}
      <path d="M112 130 C96 138 86 155 84 178 L84 225 C92 222 98 208 100 190Z" fill={s} />
      <path d="M188 130 C204 138 214 155 216 178 L216 225 C208 222 202 208 200 190Z" fill={s} />
      <ellipse cx="84" cy="228" rx="8" ry="10" fill="#F5C5A3" />
      <ellipse cx="216" cy="228" rx="8" ry="10" fill="#F5C5A3" />
    </g>
  );

  if (style === "training") return (
    <g>
      {/* 바지 */}
      <path d="M118 235 L114 370 L148 370 L150 258 L152 370 L186 370 L182 235Z" fill={p} />
      <path d="M118 235 C120 260 120 290 118 320" fill="none" stroke={s} strokeWidth="2.5" opacity="0.6" />
      <path d="M182 235 C180 260 180 290 182 320" fill="none" stroke={s} strokeWidth="2.5" opacity="0.6" />
      <ellipse cx="131" cy="372" rx="15" ry="5" fill="#F5F5F5" />
      <ellipse cx="169" cy="372" rx="15" ry="5" fill="#F5F5F5" />
      {/* 상의 */}
      <path d="M108 130 C94 136 84 150 82 168 L82 235 L218 235 L218 168 C216 150 206 136 192 130 L175 125 L150 128 L125 125Z" fill={p} />
      <line x1="150" y1="125" x2="150" y2="210" stroke={dk} strokeWidth="2.5" strokeDasharray="4,3" />
      {/* 후드 */}
      <path d="M125 130 C122 118 124 108 150 104 C176 108 178 118 175 130" fill={p} opacity="0.9" />
      {/* 팔 */}
      <path d="M108 130 C92 138 82 155 80 178 L80 228 C88 226 94 212 96 195Z" fill={p} />
      <path d="M192 130 C208 138 218 155 220 178 L220 228 C212 226 206 212 204 195Z" fill={p} />
      <ellipse cx="80" cy="232" rx="8" ry="10" fill="#F5C5A3" />
      <ellipse cx="220" cy="232" rx="8" ry="10" fill="#F5C5A3" />
    </g>
  );

  // casual
  return (
    <g>
      {/* 바지 */}
      <path d="M120 235 L116 370 L148 370 L150 260 L152 370 L184 370 L180 235Z" fill="#374151" />
      <ellipse cx="132" cy="372" rx="15" ry="5" fill="#F5F5F5" />
      <ellipse cx="168" cy="372" rx="15" ry="5" fill="#F5F5F5" />
      {/* 티셔츠 */}
      <path d="M110 130 C96 136 86 150 84 168 L84 235 L216 235 L216 168 C214 150 204 136 190 130 L174 125 L150 128 L126 125Z" fill={p} />
      <path d="M126 125 L150 132 L174 125" fill="none" stroke={dk} strokeWidth="2" />
      {/* 팔 */}
      <path d="M110 130 C95 136 86 152 84 172 L84 195 C92 192 96 180 98 168Z" fill={p} />
      <path d="M190 130 C205 136 214 152 216 172 L216 195 C208 192 204 180 202 168Z" fill={p} />
      {/* 맨팔 */}
      <rect x="78" y="192" width="14" height="40" rx="6" fill="#F5C5A3" />
      <rect x="208" y="192" width="14" height="40" rx="6" fill="#F5C5A3" />
      <ellipse cx="85" cy="236" rx="8" ry="10" fill="#F5C5A3" />
      <ellipse cx="215" cy="236" rx="8" ry="10" fill="#F5C5A3" />
    </g>
  );
}

export default function CharacterSilhouette({
  hairColor, hairLength, skinTone, eyeColor, outfitStyle, accessories, gender,
}: Props) {
  const [blink, setBlink] = useState(false);
  const [breathe, setBreathe] = useState(0);
  const o = OUTFIT_CFG[outfitStyle] || OUTFIT_CFG.stage;
  const skinDk = sh(skinTone, -18);
  const skinHi = sh(skinTone, 22);
  const hairDk = sh(hairColor, -30);

  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, Math.random() * 2000 + 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let frame: number; let t = 0;
    const run = () => { t += 0.02; setBreathe(Math.sin(t) * 2); frame = requestAnimationFrame(run); };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, []);

  const eyeS = blink ? 0.08 : 1;

  return (
    <svg viewBox="0 0 300 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fG" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={skinHi} />
          <stop offset="55%" stopColor={skinTone} />
          <stop offset="100%" stopColor={skinDk} />
        </radialGradient>
        <radialGradient id="eG" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={sh(eyeColor, 45)} />
          <stop offset="50%" stopColor={eyeColor} />
          <stop offset="100%" stopColor={sh(eyeColor, -35)} />
        </radialGradient>
      </defs>

      <g transform={`translate(0,${breathe * 0.5})`}>
        {/* 의상 + 팔 + 다리 */}
        <OutfitSVG style={outfitStyle} p={o.p} s={o.s} a={o.a} />

        {/* 목 */}
        <rect x="142" y="108" width="16" height="22" rx="6" fill={skinTone} />
        <path d="M138 125 C142 120 148 118 150 118 C152 118 158 120 162 125" fill="none" stroke={skinDk} strokeWidth="0.8" opacity="0.25" />

        {/* 얼굴 */}
        <g transform={`translate(0,${breathe * 0.3})`}>
          <ellipse cx="150" cy="72" rx="38" ry="42" fill="url(#fG)" />
          {/* 턱 음영 */}
          <ellipse cx="150" cy="108" rx="26" ry="8" fill={skinDk} opacity="0.12" />
          {/* 귀 */}
          <ellipse cx="112" cy="75" rx="5" ry="8" fill={skinTone} />
          <ellipse cx="112" cy="75" rx="3" ry="5" fill={skinDk} opacity="0.15" />
          <ellipse cx="188" cy="75" rx="5" ry="8" fill={skinTone} />
          <ellipse cx="188" cy="75" rx="3" ry="5" fill={skinDk} opacity="0.15" />
          {/* 볼터치 */}
          <ellipse cx="128" cy="85" rx="9" ry="5" fill="#FFB6C1" opacity="0.2" />
          <ellipse cx="172" cy="85" rx="9" ry="5" fill="#FFB6C1" opacity="0.2" />
          {/* 코 */}
          <path d="M147 80 C147 84 148 87 150 88 C152 87 153 84 153 80" fill="none" stroke={skinDk} strokeWidth="1" strokeLinecap="round" opacity="0.35" />

          {/* 눈썹 */}
          {gender === "male" ? (
            <>
              <path d="M127 56 C131 53 137 52 143 54" fill="none" stroke={hairDk} strokeWidth="2.8" strokeLinecap="round" />
              <path d="M157 54 C163 52 169 53 173 56" fill="none" stroke={hairDk} strokeWidth="2.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M128 57 C132 54 138 53 143 54" fill="none" stroke={hairDk} strokeWidth="2" strokeLinecap="round" />
              <path d="M157 54 C162 53 168 54 172 57" fill="none" stroke={hairDk} strokeWidth="2" strokeLinecap="round" />
            </>
          )}

          {/* 왼눈 */}
          <g transform={`translate(136,68) scale(1,${eyeS})`}>
            <ellipse cx="0" cy="0" rx="9" ry="7.5" fill="white" />
            <circle cx="0.5" cy="0.5" r="6" fill="url(#eG)" />
            <circle cx="0.5" cy="0.5" r="3.2" fill="#0a0a0a" />
            <circle cx="-1.5" cy="-1.5" r="2" fill="white" opacity="0.9" />
            <circle cx="2.5" cy="-0.5" r="0.9" fill="white" opacity="0.6" />
            <path d="M-9 -5.5 C-4.5 -9 4.5 -9 9 -5.5" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="-8" y1="-4" x2="-11" y2="-7" stroke="#111" strokeWidth="1.3" strokeLinecap="round" />
          </g>
          {/* 오른눈 */}
          <g transform={`translate(164,68) scale(1,${eyeS})`}>
            <ellipse cx="0" cy="0" rx="9" ry="7.5" fill="white" />
            <circle cx="-0.5" cy="0.5" r="6" fill="url(#eG)" />
            <circle cx="-0.5" cy="0.5" r="3.2" fill="#0a0a0a" />
            <circle cx="-3" cy="-1.5" r="2" fill="white" opacity="0.9" />
            <circle cx="1" cy="-0.5" r="0.9" fill="white" opacity="0.6" />
            <path d="M-9 -5.5 C-4.5 -9 4.5 -9 9 -5.5" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="8" y1="-4" x2="11" y2="-7" stroke="#111" strokeWidth="1.3" strokeLinecap="round" />
          </g>

          {/* 입 */}
          {gender === "female" ? (
            <g transform="translate(150,95)">
              <path d="M-8 0 C-5 -3.5 -1 -4.5 0 -3.5 C1 -4.5 5 -3.5 8 0" fill="#E88B8B" opacity="0.9" />
              <path d="M-8 0 C-4 4 4 4 8 0" fill="#F2A5A5" />
              <ellipse cx="0" cy="1.5" rx="3.5" ry="1.2" fill="white" opacity="0.3" />
            </g>
          ) : (
            <g transform="translate(150,95)">
              <path d="M-7 0 C-4 -2.5 4 -2.5 7 0 C4 3 -4 3 -7 0Z" fill="#C08080" opacity="0.8" />
            </g>
          )}
        </g>

        {/* 헤어 (얼굴 위) */}
        <HairSVG c={hairColor} length={hairLength} />

        {/* 악세서리 */}
        {accessories.includes("왕관") && (
          <g transform="translate(150,30)">
            <path d="M-20 0 L-14 -12 L-7 -2 L0 -16 L7 -2 L14 -12 L20 0Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
            <circle cx="-14" cy="-10" r="2" fill="#FF4444" />
            <circle cx="0" cy="-14" r="2.5" fill="#4444FF" />
            <circle cx="14" cy="-10" r="2" fill="#44FF44" />
          </g>
        )}
        {accessories.includes("안경") && (
          <g transform="translate(150,68)" opacity="0.85">
            <rect x="-24" y="-8" width="18" height="14" rx="3.5" fill="none" stroke="#2a2a2a" strokeWidth="1.8" />
            <rect x="6" y="-8" width="18" height="14" rx="3.5" fill="none" stroke="#2a2a2a" strokeWidth="1.8" />
            <line x1="-6" y1="-1" x2="6" y2="-1" stroke="#2a2a2a" strokeWidth="1.5" />
          </g>
        )}
        {accessories.includes("리본") && (
          <g transform="translate(180,50) rotate(-12)">
            <path d="M0 0 L-10 -7 L-10 7Z" fill="#FF69B4" />
            <path d="M0 0 L10 -7 L10 7Z" fill="#FF1493" />
            <circle cx="0" cy="0" r="3.5" fill="#FFB6C1" />
          </g>
        )}
        {accessories.includes("고양이귀") && (
          <g>
            <path d="M116 48 L124 24 L136 44" fill={hairColor} />
            <path d="M119 46 L125 28 L133 44" fill="#FFB6C1" opacity="0.55" />
            <path d="M164 44 L176 24 L184 48" fill={hairColor} />
            <path d="M167 44 L175 28 L181 46" fill="#FFB6C1" opacity="0.55" />
          </g>
        )}
        {accessories.includes("귀걸이") && (
          <g>
            <circle cx="112" cy="88" r="3" fill="#FFD700" />
            <line x1="112" y1="91" x2="112" y2="102" stroke="#FFD700" strokeWidth="1.5" />
            <circle cx="112" cy="104" r="2.5" fill="#FFD700" />
            <circle cx="188" cy="88" r="3" fill="#FFD700" />
            <line x1="188" y1="91" x2="188" y2="102" stroke="#FFD700" strokeWidth="1.5" />
            <circle cx="188" cy="104" r="2.5" fill="#FFD700" />
          </g>
        )}
        {accessories.includes("목걸이") && (
          <path d="M132 120 C138 126 144 128 150 129 C156 128 162 126 168 120" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        )}
        {accessories.includes("헤어핀") && (
          <g transform="translate(180,58) rotate(25)">
            <rect x="-1" y="-10" width="2" height="20" rx="1" fill="#FF69B4" />
            <ellipse cx="0" cy="-12" rx="4" ry="3" fill="#FF1493" />
          </g>
        )}
        {accessories.includes("날개") && (
          <g opacity="0.5">
            <path d="M82 165 C55 148 38 125 42 100 C55 118 68 140 90 156Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
            <path d="M76 172 C45 158 28 135 34 108 C50 128 62 150 85 165Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
            <path d="M218 165 C245 148 262 125 258 100 C245 118 232 140 210 156Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
            <path d="M224 172 C255 158 272 135 266 108 C250 128 238 150 215 165Z" fill="white" stroke="#E0E0E0" strokeWidth="1" />
          </g>
        )}
        {accessories.includes("마스크") && (
          <rect x="130" y="80" width="40" height="26" rx="8" fill="white" opacity="0.9" stroke="#ddd" strokeWidth="1" />
        )}
      </g>
    </svg>
  );
}
