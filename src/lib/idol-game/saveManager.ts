// 아이돌 게임 시뮬레이터 세이브/로드 매니저

const HEADERS = { "Content-Type": "application/json" };

/** 게임 상태를 서버에 저장 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveGame(
  payload: any
): Promise<{ savedAt: string } | null> {
  try {
    const res = await fetch("/api/idol-game/save", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) {
      console.error("[saveGame] 저장 실패:", json.error);
      return null;
    }
    return json.data as { savedAt: string };
  } catch (err) {
    console.error("[saveGame] 네트워크 오류:", err);
    return null;
  }
}

/** 서버에서 저장된 게임 불러오기 */
export async function loadGame(): Promise<{
  hasSave: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  save?: any;
} | null> {
  try {
    const res = await fetch("/api/idol-game/save", {
      method: "GET",
      headers: HEADERS,
    });
    const json = await res.json();
    if (!json.success) {
      console.error("[loadGame] 불러오기 실패:", json.error);
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json.data as { hasSave: boolean; save?: any };
  } catch (err) {
    console.error("[loadGame] 네트워크 오류:", err);
    return null;
  }
}

/** 현재 에너지 상태 조회 */
export async function checkEnergy(): Promise<{
  current: number;
  max: number;
  resetAt: string;
} | null> {
  try {
    const res = await fetch("/api/idol-game/energy", {
      method: "GET",
      headers: HEADERS,
    });
    const json = await res.json();
    if (!json.success) {
      console.error("[checkEnergy] 조회 실패:", json.error);
      return null;
    }
    return json.data as { current: number; max: number; resetAt: string };
  } catch (err) {
    console.error("[checkEnergy] 네트워크 오류:", err);
    return null;
  }
}

/** 에너지 소비 요청 */
export async function consumeEnergy(
  amount: number
): Promise<
  | { remaining: number }
  | { error: string; code: string; resetAt: string }
  | null
> {
  try {
    const res = await fetch("/api/idol-game/energy", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ amount }),
    });
    const json = await res.json();

    // 에너지 부족 (409 Conflict)
    if (res.status === 409) {
      return json.data as { error: string; code: string; resetAt: string };
    }

    if (!json.success) {
      console.error("[consumeEnergy] 소비 실패:", json.error);
      return null;
    }
    return json.data as { remaining: number };
  } catch (err) {
    console.error("[consumeEnergy] 네트워크 오류:", err);
    return null;
  }
}
