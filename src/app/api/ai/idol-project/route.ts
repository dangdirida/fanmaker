import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── 내장 세계관 템플릿 풀 ──
const WORLD_TEMPLATES = [
  {
    tags: ["우주","별","빛","은하","cosmos"],
    mood: ["bright","neutral"],
    title: "스텔라 오딧세이",
    summary: "빛과 어둠이 교차하는 우주에서 각기 다른 별에서 소환된 존재들이 만나 하나의 팀을 이룬다. 그들은 사라져가는 별빛을 되살리기 위한 여정을 시작한다.",
    background: "머나먼 미래, 우주는 서서히 빛을 잃어가고 있다. 각 행성의 수호자로 선택된 이들이 은하의 중심으로 모여든다. 그들이 가진 고유한 능력은 별의 원소에서 비롯된 것으로, 합쳐질 때 비로소 진정한 힘을 발휘한다.",
    conflict: "어둠의 세력 '보이드'가 별빛 에너지를 흡수하며 우주를 잠식하고 있다. 팀은 각 별자리에 숨겨진 고대 유물을 모아 우주의 균형을 되찾아야 한다.",
    symbolism: "별은 각 멤버의 고유한 개성을 상징하며, 모였을 때 완성되는 별자리는 팀의 조화를 의미한다.",
    keywords: ["별빛","우주","수호자","은하","균형"]
  },
  {
    tags: ["꿈","환상","몽환","마법","dream"],
    mood: ["bright","neutral"],
    title: "드림 아르카나",
    summary: "현실과 꿈의 경계에 존재하는 비밀 왕국에서 꿈을 지키는 수호자들의 이야기. 사람들의 꿈이 사라지는 위기 속에서 그들만의 여정이 시작된다.",
    background: "모든 인간이 잠드는 순간, 또 다른 세계 '아르카나'가 깨어난다. 이 세계를 지키는 선택받은 이들은 사람들의 꿈에서 힘을 얻어 성장한다. 각자가 관장하는 꿈의 영역이 있으며 서로 다른 감정의 색채를 품고 있다.",
    conflict: "악몽의 군주 '나이트메어'가 아르카나를 침략해 사람들의 꿈을 공포로 물들이고 있다. 수호자들은 잃어버린 꿈의 조각들을 모아 세계를 복원해야 한다.",
    symbolism: "꿈의 색채는 각 멤버의 감정과 능력을 상징하며, 다채로운 색이 모여 완전한 무지개를 이룬다.",
    keywords: ["꿈","환상","수호","색채","아르카나"]
  },
  {
    tags: ["사이버","미래","기술","ai","cyber","neon"],
    mood: ["dark","neutral"],
    title: "네온 매트릭스",
    summary: "2099년, 디지털과 현실이 융합된 메가시티. AI와 인간의 경계가 흐려진 세상에서 자신의 정체성을 찾아가는 이들의 이야기.",
    background: "메가시티 '넥서스'는 모든 것이 연결된 거대한 디지털 생태계다. 시민들은 뇌에 칩을 이식해 가상과 현실을 넘나들며, 정보는 곧 권력이 된 세상이다. 주인공들은 이 시스템 밖에서 진정한 자유를 꿈꾸는 존재들이다.",
    conflict: "중앙 AI '오라클'이 모든 인간의 감정 데이터를 수집해 통제하려 한다. 팀은 오라클의 감시망을 피해 인류의 자유 의지를 지키기 위한 작전을 수행한다.",
    symbolism: "네온 빛은 디지털 세계의 화려함 속에 숨겨진 인간의 감정을 상징한다.",
    keywords: ["사이버","자유","정체성","디지털","반란"]
  },
  {
    tags: ["자연","식물","치유","earth","heal","green"],
    mood: ["bright","neutral"],
    title: "가이아 블룸",
    summary: "자연의 정령들이 인간 세계에 깨어나 잃어버린 지구의 생명력을 회복하는 여정. 식물과 동물의 언어를 이해하는 이들이 모여 새로운 균형을 만든다.",
    background: "오래전 자연과 인간이 공존하던 시절, 지구 곳곳에 자연의 정령이 깃들어 있었다. 산업화로 잠들었던 이 정령들이 지구의 위기와 함께 각성하기 시작한다. 각자 다른 자연 원소를 관장하며 독특한 능력을 지녔다.",
    conflict: "오염과 개발로 자연의 영역이 줄어들면서 정령들의 힘이 약해지고 있다. 고대 숲의 심장부에 잠든 대지의 어머니를 깨워 지구를 치유해야 한다.",
    symbolism: "꽃의 개화는 팀의 성장과 각성을, 사계절의 순환은 끊임없는 변화와 성장을 상징한다.",
    keywords: ["자연","치유","각성","생명","공존"]
  },
  {
    tags: ["어둠","신비","달","gothic","dark","moon"],
    mood: ["dark"],
    title: "루나 카르텔",
    summary: "달의 이면에 존재하는 비밀 결사대. 낮에는 평범한 얼굴로, 밤에는 세상의 균형을 지키는 그림자 수호자들의 이야기.",
    background: "수천 년 전부터 이어진 비밀 조직 '루나 카르텔'은 세상의 어두운 면을 관리하는 역할을 맡아왔다. 멤버들은 달의 주기에 따라 각기 다른 능력이 각성되며, 그들만의 언어와 규율로 움직인다.",
    conflict: "봉인되었던 고대의 혼돈 세력이 부활의 기미를 보이고 있다. 카르텔은 내부의 배신자를 찾아내는 동시에 혼돈의 부활을 막아야 하는 이중의 위기에 처한다.",
    symbolism: "달의 차고 기움은 팀의 성장과 시련을, 별빛은 어둠 속에서도 꺼지지 않는 희망을 상징한다.",
    keywords: ["달","그림자","비밀","균형","각성"]
  },
  {
    tags: ["음악","노래","멜로디","music","sound"],
    mood: ["bright","neutral"],
    title: "소닉 임펄스",
    summary: "소리에 깃든 감정이 실체가 되는 세계에서 음악으로 세상을 치유하는 아티스트들의 여정. 각자의 목소리로 세상의 균열을 봉합한다.",
    background: "이 세계에서 진심 어린 노래는 물리적 형태를 띤다. 슬픔의 선율은 비가 되고, 기쁨의 화음은 빛이 되어 세상을 물들인다. 고대부터 이어진 소닉 아티스트들은 음악의 힘으로 세상의 감정적 균형을 유지해왔다.",
    conflict: "세상의 감정이 극단으로 치닫으면서 소리의 균형이 무너지고 있다. 불협화음이 만들어내는 균열이 세계 곳곳에서 나타나기 시작했고, 팀은 잃어버린 '원초의 화음'을 찾아 세상을 되돌려야 한다.",
    symbolism: "각 멤버의 목소리는 서로 다른 감정의 색깔을 지니며, 하모니는 개인을 넘어선 하나됨을 상징한다.",
    keywords: ["음악","화음","감정","치유","공명"]
  },
  {
    tags: ["시간","역사","과거","time","history"],
    mood: ["neutral","dark"],
    title: "크로노스 코드",
    summary: "시간의 균열을 봉합하는 특수 요원들. 역사의 결정적 순간마다 개입해 인류의 미래를 지키는 타임 에이전트들의 이야기.",
    background: "21세기 말, 인류는 우연히 시간 여행 기술을 개발했다. 그러나 이 기술의 남용으로 시간선에 균열이 생기기 시작했다. 특수 기관 '크로노스'는 각 시대에서 선발된 에이전트들로 구성되어 시간의 질서를 수호한다.",
    conflict: "누군가 의도적으로 역사의 중요 사건들을 바꾸려 하고 있다. 팀은 과거, 현재, 미래를 넘나들며 시간의 균형을 무너뜨리려는 세력과 맞서야 한다.",
    symbolism: "모래시계는 유한한 시간 속의 무한한 가능성을, 나침반은 어떤 시대에서도 변하지 않는 올바른 방향을 상징한다.",
    keywords: ["시간","역사","균형","수호","모험"]
  },
  {
    tags: ["불꽃","열정","에너지","fire","passion","power"],
    mood: ["bright","dark"],
    title: "플레임 유니버스",
    summary: "내면의 불꽃이 실제 힘이 되는 세계. 각자의 열정과 의지로 어둠을 밝히는 다섯 전사들의 이야기.",
    background: "고대로부터 전해지는 전설에 따르면, 순수한 열정과 의지를 가진 자는 내면의 불꽃을 현실로 끌어낼 수 있다. 이 능력자들은 '플레임 가디언'이라 불리며, 각기 다른 속성의 불꽃을 지녔다.",
    conflict: "세상의 열정과 의지를 삼키는 '그레이 포그'가 퍼지면서 사람들이 무기력해지고 있다. 가디언들은 고대의 불꽃 성역을 찾아 그레이 포그의 근원을 소멸시켜야 한다.",
    symbolism: "불꽃은 결코 꺼지지 않는 열정과 생명력을, 재는 모든 것을 태운 후 새롭게 시작하는 변화를 상징한다.",
    keywords: ["열정","불꽃","의지","변화","각성"]
  },
];

const NAME_POOL: Record<string, Array<{name:string; meaning:string; romanization:string}>> = {
  bright: [
    {name:"루미나",meaning:"빛을 밝히는 자들",romanization:"LUMINA"},
    {name:"솔라이즈",meaning:"태양처럼 떠오르다",romanization:"SOLARISE"},
    {name:"오로라",meaning:"새벽빛의 시작",romanization:"AURORA"},
    {name:"플레어",meaning:"찬란히 빛나는",romanization:"FLARE"},
    {name:"선샤인",meaning:"끊임없는 햇살",romanization:"SUNSHINE"},
    {name:"프리즘",meaning:"다채로운 빛의 조각",romanization:"PRISM"},
    {name:"스텔라",meaning:"별들의 모임",romanization:"STELLA"},
    {name:"블리스",meaning:"순수한 기쁨",romanization:"BLISS"},
    {name:"이터널",meaning:"영원히 빛나는",romanization:"ETERNAL"},
    {name:"노바",meaning:"새로운 별의 탄생",romanization:"NOVA"},
  ],
  dark: [
    {name:"에클립스",meaning:"빛과 어둠이 교차하는",romanization:"ECLIPSE"},
    {name:"루나틱",meaning:"달빛에 이끌리는",romanization:"LUNATIC"},
    {name:"섀도우",meaning:"빛 너머의 존재",romanization:"SHADOW"},
    {name:"다크매터",meaning:"보이지 않는 힘",romanization:"DARKMATTER"},
    {name:"미드나이트",meaning:"가장 깊은 밤의 순간",romanization:"MIDNIGHT"},
    {name:"네뷸라",meaning:"우주의 어두운 성운",romanization:"NEBULA"},
    {name:"크림슨",meaning:"붉은 열정과 어둠",romanization:"CRIMSON"},
    {name:"아비스",meaning:"끝없는 심연",romanization:"ABYSS"},
    {name:"레이스",meaning:"그림자 속 존재",romanization:"WRAITH"},
    {name:"미라쥬",meaning:"신기루처럼 신비로운",romanization:"MIRAGE"},
  ],
  neutral: [
    {name:"엘리시아",meaning:"이상향의 수호자",romanization:"ELYSIA"},
    {name:"크로노스",meaning:"시간의 지배자",romanization:"CHRONOS"},
    {name:"에테르",meaning:"순수한 본질",romanization:"AETHER"},
    {name:"아우라",meaning:"빛나는 기운",romanization:"AURA"},
    {name:"셀레스",meaning:"천상의 존재",romanization:"CELESTE"},
    {name:"넥서스",meaning:"모든 것의 연결점",romanization:"NEXUS"},
    {name:"이퀴녹스",meaning:"균형의 순간",romanization:"EQUINOX"},
    {name:"오라클",meaning:"미래를 보는 자",romanization:"ORACLE"},
    {name:"임펄스",meaning:"강렬한 첫인상",romanization:"IMPULSE"},
    {name:"아크",meaning:"새로운 시작의 호",romanization:"ARC"},
  ],
};

function selectTemplate(keywords: string, mood: string) {
  const kws = keywords.toLowerCase();
  let best = WORLD_TEMPLATES[0];
  let bestScore = 0;
  for (const t of WORLD_TEMPLATES) {
    const moodMatch = t.mood.includes(mood) ? 3 : 0;
    const tagMatch = t.tags.filter(tag => kws.includes(tag)).length * 2;
    const score = moodMatch + tagMatch;
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return best;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { action, data } = await req.json();

  try {
    if (action === "worldbuilding") {
      const t = selectTemplate(data.keywords || "", data.mood || "bright");
      const userKws = (data.keywords || "").split(/[,\s]+/).map((k: string) => k.trim()).filter(Boolean).slice(0, 3);
      const extraKws = userKws.length > 0 ? userKws : t.keywords;
      return NextResponse.json({
        success: true,
        data: {
          title: t.title,
          summary: t.summary,
          background: t.background,
          conflict: t.conflict,
          symbolism: t.symbolism,
          keywords: Array.from(new Set([...extraKws, ...t.keywords])).slice(0, 5),
        }
      });
    }

    if (action === "names") {
      const mood = data.mood || "neutral";
      const pool = NAME_POOL[mood] || NAME_POOL.neutral;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return NextResponse.json({ success: true, data: { candidates: shuffled } });
    }

    if (action === "member") {
      const idx = Number(data.memberIndex ?? 0);
      const groupName = String(data.groupName || "그룹");
      const names = ["지우","하늘","서윤","다온","이든","루나","아린","세아","유리","지호","시온","나은"];
      const personalities = [
        "팀의 분위기 메이커로 밝고 에너지 넘친다. 어떤 상황에서도 웃음을 잃지 않으며 팀원들에게 힘을 준다.",
        "조용하지만 깊은 통찰력을 가진 멤버. 말보다 행동으로 보여주며 위기 상황에서 진가를 발휘한다.",
        "자유로운 영혼의 소유자. 틀에 얽매이지 않는 창의적 사고로 팀에 새로운 시각을 제시한다.",
        "강한 의지와 리더십을 갖춘 멤버. 팀을 이끄는 타고난 감각으로 어려운 결정도 흔들림 없이 내린다.",
        "감수성이 풍부하고 공감 능력이 뛰어나다. 팀원들의 감정을 세심하게 챙기며 하모니를 만든다.",
      ];
      const roles = [
        `${groupName}의 심장부에서 팀의 의지를 하나로 모으는 구심점 역할을 한다.`,
        `어둠 속에서도 길을 잃지 않도록 방향을 제시하는 나침반 같은 존재다.`,
        `팀의 약점을 보완하고 강점을 극대화하는 전략가 역할을 담당한다.`,
        `외부의 위협으로부터 팀을 보호하는 방패이자 공격의 선봉에 서는 존재다.`,
        `팀의 감정적 균형을 유지하며 구성원들이 최고의 퍼포먼스를 낼 수 있도록 돕는다.`,
      ];
      const catchphrases = ["빛이 되어","함께라면","끝까지 가자","우리의 시간","별이 될게","지금 이 순간","두려움 없이","내가 여기","한 걸음씩","세상을 바꾸자"];

      return NextResponse.json({
        success: true,
        data: {
          name: names[idx % names.length],
          nameEn: names[idx % names.length].toUpperCase(),
          personality: personalities[idx % personalities.length],
          role: roles[idx % roles.length],
          catchphrase: catchphrases[idx % catchphrases.length],
        }
      });
    }

    if (action === "finalProfile") {
      const groupName = String(data.groupName || "그룹");
      const members = Array.isArray(data.members)
        ? (data.members as Array<{name:string}>).map(m=>m.name).filter(Boolean)
        : [];
      const worldTitle = (data.worldbuilding as {title?:string}|null)?.title || "새로운 세계";
      const genres = Array.isArray((data.groupConcept as {genres?:string[]}|null)?.genres)
        ? (data.groupConcept as {genres:string[]}).genres.join(", ")
        : "K-pop";

      const colors = [
        {code:"#6366f1", name:"인디고 퍼플"},
        {code:"#ec4899", name:"핫 핑크"},
        {code:"#14b8a6", name:"틸 그린"},
        {code:"#f59e0b", name:"골든 앰버"},
        {code:"#3b82f6", name:"로얄 블루"},
        {code:"#8b5cf6", name:"바이올렛"},
        {code:"#ef4444", name:"크림슨 레드"},
        {code:"#10b981", name:"에메랄드"},
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const memberStr = members.length > 0 ? members.join(", ") : "멤버들";

      return NextResponse.json({
        success: true,
        data: {
          officialBio: `${groupName}은 ${worldTitle}의 세계관을 바탕으로 탄생한 K-pop 그룹이다. ${memberStr}으로 구성된 이들은 ${genres} 장르를 중심으로 강렬한 퍼포먼스와 깊이 있는 음악으로 팬들과 소통한다. 각자의 개성이 모여 하나의 완전한 세계를 만들어낸다.`,
          debutConcept: `${worldTitle}의 서사를 음악으로 풀어낸 데뷔 앨범으로 첫 발을 내딛으며, 강렬한 비주얼과 탄탄한 퍼포먼스로 존재감을 알린다.`,
          fandomName: `'${groupName.charAt(0)}타' -- ${groupName}과 함께 별이 되는 팬들의 이름. 팀의 빛을 받아 빛나는 존재들을 의미한다.`,
          colorCode: color.code,
          colorName: color.name,
          slogan: `${groupName}, 우리가 빛이다`,
        }
      });
    }

    return NextResponse.json({ success: false, error: "unknown action" }, { status: 400 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
