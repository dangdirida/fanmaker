# 아이돌 키우기 시뮬레이터 — PRD v1.0
**버전:** 1.0  
**작성일:** 2026년 3월  
**문서 상태:** Claude Code 개발 명령용 최종본  
**위치:** FanMaker PRD v3.0에 Sprint 18~22로 추가  
**URL 경로:** `/studio/idol-game`  
**기술 스택:** Next.js 14 (App Router) + TypeScript + Three.js(@pixiv/three-vrm) + Zustand

---

## 목차
1. [서비스 개요](#1-서비스-개요)
2. [개발 Sprint 순서](#2-개발-sprint-순서)
3. [디렉토리 구조](#3-디렉토리-구조)
4. [데이터베이스 스키마 추가분](#4-데이터베이스-스키마-추가분)
5. [게임 설정 플로우 (새 게임 시작)](#5-게임-설정-플로우-새-게임-시작)
6. [VRM 캐릭터 시스템](#6-vrm-캐릭터-시스템)
7. [씬 엔진 & 대화 시스템](#7-씬-엔진--대화-시스템)
8. [씬 스크립트 JSON 포맷](#8-씬-스크립트-json-포맷)
9. [배경 이미지 에셋 목록](#9-배경-이미지-에셋-목록)
10. [전체 씬 스크립트 & 스토리](#10-전체-씬-스크립트--스토리)
11. [스탯 & 분기 시스템](#11-스탯--분기-시스템)
12. [카메라 댄스 평가 시스템](#12-카메라-댄스-평가-시스템)
13. [세이브 & 복귀 시스템](#13-세이브--복귀-시스템)
14. [팬메이커 스튜디오 연동](#14-팬메이커-스튜디오-연동)
15. [팬 유니버스 공유 연동](#15-팬-유니버스-공유-연동)
16. [UI 컴포넌트 명세](#16-ui-컴포넌트-명세)
17. [API 명세](#17-api-명세)
18. [QA 체크리스트](#18-qa-체크리스트)

---

## 1. 서비스 개요

### 한 줄 정의
K-pop 팬이 프로듀서가 되어 아이돌 그룹을 처음부터 직접 기획하고, 연습생 단계부터 레전드까지 육성하는 2D 비주얼노벨 시뮬레이션 게임.

### 핵심 설계 원칙
- **이모티콘 금지:** UI 전체에서 Apple 기본 이모티콘(emoji) 일체 사용하지 않음. 아이콘은 lucide-react SVG 아이콘 또는 텍스트 기호만 사용.
- **2D 비주얼노벨 형식:** 전체 화면 배경 이미지 + 하단 고정 대화창 + 선택지 UI. 미연시/모동숲 스타일.
- **VRM 기본 모델:** 커스터마이징 전 `female_casual.vrm` / `male_casual.vrm` 파일을 Three.js로 렌더링. `/public/models/` 폴더에 저장.
- **프리셋 배경 이미지:** AI로 미리 생성한 이미지를 씬 조건에 따라 자동 교체. 실시간 AI 생성 없음.
- **자동 세이브:** 선택지 클릭 즉시 DB 저장. 재접속 시 마지막 씬부터 자동 복귀.
- **스튜디오 연동:** 게임 내 특정 미션에서 팬메이커의 버추얼 스튜디오, 컨셉 스튜디오, 퍼포먼스 플래너, 글로벌 싱크가 팝업으로 열림.

### 플레이 타임 설계
- 하루 10~15분 기준 2~4주 완주 가능
- 에너지 시스템: 하루 에너지 5포인트 (Pro 유저 10포인트). 주요 선택지 소비 1포인트. 자정 초기화.
- 에너지 소진 시: "오늘은 여기까지. 내일 다시 돌아오세요." 메시지 + 내일 복귀 유도

### 전체 게임 단계 구조
```
[새 게임 설정] -> 그룹명 / 인원 / 성별 / 기본 컨셉 입력
     |
[Chapter 1: 결성] Week 1~2 — 연습생 단계
     |
[Chapter 2: 훈련] Week 3~6 — 데뷔조 도전 단계
     |
[Chapter 3: 데뷔] Week 7~8 — 신인 아이돌 단계
     |
[Chapter 4: 성장] Week 9~14 — 인기 아이돌 단계
     |
[Chapter 5: 정상] Week 15~20 — 톱스타 단계
     |
[엔딩 분기] 4개 루트 — 레전드 / 대상 / 글로벌 / 위기
```

---

## 2. 개발 Sprint 순서

> 기존 FanMaker PRD v3.0의 Sprint 17 완료 후 순서대로 진행.

---

### Sprint 18 — 게임 설정 플로우 & VRM 캐릭터 렌더링

**Claude Code 명령:**
```
아이돌 키우기 시뮬레이터의 게임 설정 화면과 VRM 캐릭터 렌더링을 구현해줘.

1. app/(main)/studio/idol-game/page.tsx
   - 세이브 데이터 확인 (GET /api/idol-game/save)
   - 세이브 있으면: 이어하기 / 새로 시작 선택 화면
   - 세이브 없으면: 새 게임 설정 플로우로 진입

2. app/(main)/studio/idol-game/setup/page.tsx — 새 게임 설정 화면
   4단계 스텝퍼 (상단 진행 표시기):

   Step 1: 그룹 기본 정보
   - 그룹명 입력 (한글/영문, 최대 20자, 실시간 중복 체크 불필요)
   - 그룹 유형 선택: [걸그룹] [보이그룹] [혼성그룹]
   - 인원 수 선택: 2~9명 (버튼 클릭 방식, 숫자 크게 표시)
   - 데뷔 목표 컨셉 선택 (카드 UI, 1개 필수):
     [다크 & 카리스마] [청량 & 성장형] [감성 아티스트] [큐트 & 발랄] [실험적 & 독창적]

   Step 2: 멤버 성별 배정
   - 선택한 인원 수만큼 멤버 슬롯 표시 (예: 5명이면 5개 슬롯)
   - 각 슬롯에 멤버 번호 표시 (멤버 1, 멤버 2, ...)
   - 슬롯마다 [여성] [남성] 토글 버튼
   - 그룹 유형이 걸그룹이면 모두 여성으로 자동 설정 (수정 불가)
   - 보이그룹이면 모두 남성으로 자동 설정 (수정 불가)
   - 혼성그룹이면 개별 선택 가능
   - 하단에 VRM 모델 미리보기: 선택한 성별에 따라 female_casual.vrm / male_casual.vrm 표시

   Step 3: 멤버 이름 입력
   - 인원 수만큼 이름 입력 필드 (예명, 최대 10자)
   - 빈칸이면 "멤버1", "멤버2" 기본값 자동 적용
   - 각 멤버 이름 옆에 성별 아이콘 표시

   Step 4: 설정 확인 & 시작
   - 입력한 전체 정보 요약 카드 표시
   - 그룹명 / 유형 / 인원 / 컨셉 / 멤버 목록
   - [게임 시작] 버튼 클릭 -> POST /api/idol-game/save (초기 데이터 생성) -> /studio/idol-game/play로 이동

3. components/idol-game/VRMViewer.tsx
   - @pixiv/three-vrm 라이브러리 사용
   - props: { gender: 'female' | 'male', scale?: number, position?: [x,y,z] }
   - /public/models/female_casual.vrm 또는 male_casual.vrm 로드
   - Three.js WebGLRenderer + OrbitControls 없음 (정면 고정 뷰)
   - 모델 로딩 중: 스켈레톤 플레이스홀더
   - 모델 로딩 실패 시: CSS로 만든 기본 실루엣 표시 (fallback)

4. 패키지 설치:
   @pixiv/three-vrm
   three
   @types/three
```

**완료 기준:**
- [ ] 4단계 설정 스텝퍼 동작 (앞뒤 이동 가능)
- [ ] 인원 수에 따라 멤버 슬롯 동적 생성
- [ ] 성별 선택 시 VRM 모델 교체 미리보기
- [ ] 그룹명 + 멤버 이름 입력 후 게임 시작 가능
- [ ] 초기 세이브 데이터 DB 저장 확인

---

### Sprint 19 — 씬 엔진 & 게임 화면 구현

**Claude Code 명령:**
```
아이돌 시뮬레이터의 핵심 게임 화면을 구현해줘.

1. app/(main)/studio/idol-game/play/page.tsx — 메인 게임 화면
   전체 화면 구성 (overflow hidden, 모바일도 지원):

   [상단 고정 스탯 바]
   - 배경: 반투명 다크 패널 (backdrop-blur)
   - 좌측: 스탯 4개 가로 나열
     * 보컬 (파란색 수치 + 미니 바)
     * 댄스 (핑크색 수치 + 미니 바)
     * 매력 (오렌지색 수치 + 미니 바)
     * 멘탈 (초록색 수치 + 미니 바)
   - 우측: 그룹명 (serif 폰트) / 현재 단계 배지 / Week 표시
   - 스탯 값 변화 시 숫자 카운트업/다운 애니메이션

   [씬 배경 영역] (flex: 1)
   - 전체 화면 배경 이미지 (object-fit: cover)
   - 씬 전환 시 노이즈 아웃(검정 오버레이 fade-in 0.35s) -> 이미지 교체 -> fade-out 0.35s
   - 중요 씬 진입 시 씬 타이틀 텍스트 플래시 (중앙, 1.5초 후 사라짐)
   - 무대/공연 씬: 상단에서 내려오는 스포트라이트 효과 (CSS radial-gradient)

   [캐릭터 영역] (position: absolute, bottom: 대화창 높이 + 20px)
   - VRM 모델들을 수평으로 배치 (인원 수에 따라 간격 자동 조정)
   - 대화 중인 멤버: scale(1.05) translateY(-6px) + 밝기 100%
   - 비활성 멤버: scale(0.96) + 밝기 60%
   - 공연/무대 씬: 전체 멤버 댄스 애니메이션 (상하 바운스 @keyframes)
   - VRM 모델 로드 실패 시 CSS 실루엣 fallback

   [하단 고정 대화창] (min-height: 180px)
   - 배경: rgba(0,0,0,0.88) + border-top 반투명 보라색 라인
   - 발화자 이름 (상단 좌측, 강조 컬러)
   - 대사 텍스트 (타이핑 효과: 22ms/글자)
   - 타이핑 중 클릭 시: 전체 텍스트 즉시 표시
   - 텍스트 완료 후:
     * 선택지 있음: 선택지 버튼 그리드 표시 (2열)
     * 선택지 없음: "다음" 화살표 버튼 표시 (우측 하단)

   [선택지 버튼]
   - 반투명 보라색 배경 + 테두리
   - hover 시 밝아짐 + translateY(-1px)
   - 카메라 댄스 선택지: 핑크 강조 테두리
   - 보너스 표시 있는 선택지: 우측에 소형 배지 ("+댄스 보너스" 등)
   - 클릭 즉시 선택지 숨김 + 세이브 + 씬 전환

   [스탯 변화 팝업] (position: absolute, 우상단)
   - 선택지 클릭 후 각 스탯 변화량 표시
   - 상승: 초록 배지 "▲ 댄스 +12"
   - 하강: 빨간 배지 "▼ 멘탈 -8"
   - 1.8초 후 위로 사라지는 애니메이션

   [세이브 완료 토스트] (position: absolute, 하단 중앙)
   - "저장됨" 텍스트 + 체크 아이콘
   - 선택지 클릭 후 1.5초간 표시

2. store/useIdolGameStore.ts (Zustand)
   interface IdolGameState {
     groupName: string
     groupType: 'girl' | 'boy' | 'mixed'
     concept: string
     members: Member[]
     stats: { vocal: number; dance: number; charm: number; mental: number }
     stage: string
     week: number
     energy: number
     currentSceneId: string
     flags: Record<string, boolean>  // 특수 상태 플래그
     choiceHistory: string[]
     conceptBoardAssets: { logoUrl?: string; coverUrl?: string }
   }
   interface Member {
     id: string
     name: string
     gender: 'female' | 'male'
     customImageUrl?: string  // 버추얼 스튜디오 커스터마이징 후 저장
   }

3. lib/idol-game/sceneEngine.ts
   - loadScene(sceneId): SceneData 반환
   - applyEffect(effect): 스탯 업데이트 + 클램핑 (0~100)
   - checkFlags(conditions): 분기 조건 평가
   - getNextSceneId(scene, choiceIndex): 다음 씬 결정
   - 씬 데이터는 /data/idol-game/scenes/ 폴더의 JSON 파일들에서 로드
```

**완료 기준:**
- [ ] 게임 화면 전체 렌더링 (배경 + 캐릭터 + 대화창)
- [ ] 타이핑 효과 + 즉시 표시 클릭 동작
- [ ] 선택지 클릭 -> 스탯 변화 -> 세이브 -> 씬 전환 전체 흐름
- [ ] 씬 전환 노이즈 아웃 효과
- [ ] VRM 캐릭터 활성/비활성 상태 전환

---

### Sprint 20 — 씬 스크립트 전체 콘텐츠 작성

**Claude Code 명령:**
```
/data/idol-game/scenes/ 폴더에 아래 씬 스크립트 JSON 파일들을 전부 작성해줘.
[10. 전체 씬 스크립트 & 스토리] 섹션의 내용을 그대로 구현.
각 파일은 SceneData[] 배열 형식.
```

---

### Sprint 21 — 카메라 댄스 + 스튜디오 연동 + 세이브 시스템

**Claude Code 명령:**
```
1. 카메라 댄스 평가 모달 구현 (components/idol-game/CameraDanceModal.tsx)
   [12. 카메라 댄스 평가 시스템] 섹션 내용 그대로 구현

2. 버추얼 스튜디오 연동 팝업 (components/idol-game/VirtualStudioPopup.tsx)
   [14. 팬메이커 스튜디오 연동] 섹션 내용 그대로 구현

3. 세이브 API 구현 [17. API 명세] 섹션 기준

4. 팬 유니버스 공유 [15. 팬 유니버스 공유 연동] 섹션 내용 구현
```

---

### Sprint 22 — 엔딩 + 2회차 + 팬 유니버스 최종 연동

**Claude Code 명령:**
```
1. 4개 엔딩 씬 구현 (레전드 / 대상 / 글로벌 / 위기 루트)
2. 엔딩 결과 카드 페이지 구현
3. 2회차 히든 씬 해금 로직
4. 팬 유니버스 "게임 스토리 공유" 카드 자동 생성
5. 전체 QA 및 에너지 시스템 최종 점검
```

---

## 3. 디렉토리 구조

```
app/(main)/studio/idol-game/
  page.tsx                    # 진입점 (세이브 확인 / 이어하기 / 새 게임)
  setup/
    page.tsx                  # 새 게임 설정 4단계 스텝퍼
  play/
    page.tsx                  # 메인 게임 화면

components/idol-game/
  VRMViewer.tsx               # VRM 모델 렌더링 컴포넌트
  SceneRenderer.tsx           # 배경 + 캐릭터 + 씬 전환
  DialogBox.tsx               # 하단 대화창 + 타이핑 효과
  ChoiceButtons.tsx           # 선택지 버튼 그리드
  StatBar.tsx                 # 상단 스탯 바
  StatChangePopup.tsx         # 스탯 변화 팝업 (+/-)
  SceneTitleFlash.tsx         # 씬 타이틀 플래시
  CameraDanceModal.tsx        # 카메라 댄스 평가 모달
  VirtualStudioPopup.tsx      # 버추얼 스튜디오 연동 팝업
  ConceptBoardPanel.tsx       # 컨셉 보드 누적 UI
  SaveToast.tsx               # 저장 완료 토스트
  EnergyBar.tsx               # 에너지 잔량 표시
  EndingResultCard.tsx        # 엔딩 결과 카드

store/
  useIdolGameStore.ts         # Zustand 전체 게임 상태

lib/idol-game/
  sceneEngine.ts              # 씬 로드 / 분기 / 스탯 계산
  saveManager.ts              # 세이브 / 로드 / 자동저장

data/idol-game/scenes/
  chapter1_setup.json         # Chapter 1: 결성 씬들
  chapter2_training.json      # Chapter 2: 훈련 씬들
  chapter3_debut.json         # Chapter 3: 데뷔 씬들
  chapter4_growth.json        # Chapter 4: 성장 씬들
  chapter5_top.json           # Chapter 5: 정상 씬들
  endings.json                # 4개 엔딩 씬들
  hidden.json                 # 2회차 히든 씬들

public/
  models/
    female_casual.vrm         # 여성 기본 VRM 모델
    male_casual.vrm           # 남성 기본 VRM 모델
  backgrounds/idol-game/
    practice_room.jpg         # 연습실
    practice_room_night.jpg   # 연습실 야간
    dorm_room.jpg             # 숙소
    dorm_room_night.jpg       # 숙소 야간
    conference_room.jpg       # 회의실
    evaluation_hall.jpg       # 심사장
    backstage.jpg             # 백스테이지
    music_show_stage.jpg      # 음악방송 무대
    concert_stage.jpg         # 콘서트 무대
    debut_stage.jpg           # 데뷔 무대
    recording_studio.jpg      # 녹음실
    photo_studio.jpg          # 사진 스튜디오
    airport.jpg               # 공항
    overseas_stage.jpg        # 해외 무대
    award_ceremony.jpg        # 시상식장
    award_ceremony_win.jpg    # 시상식 수상 순간
    rooftop_night.jpg         # 옥상 야경
    press_conference.jpg      # 기자회견장
    sns_viral_bg.jpg          # SNS 바이럴 연출 배경
    crisis_empty_stage.jpg    # 위기 루트 빈 무대

app/api/idol-game/
  save/route.ts               # GET(로드) / POST(저장)
  energy/route.ts             # GET(잔량) / POST(소비) / 자정 초기화
```

---

## 4. 데이터베이스 스키마 추가분

기존 `prisma/schema.prisma`에 아래 모델 추가:

```prisma
model IdolGameSave {
  id            String   @id @default(cuid())
  userId        String   @unique
  slotIndex     Int      @default(0)   // 0: 슬롯1, 1: 슬롯2, 2: 슬롯3
  groupName     String
  groupType     String                 // 'girl' | 'boy' | 'mixed'
  concept       String
  membersJson   Json                   // Member[] 배열
  statsJson     Json                   // { vocal, dance, charm, mental }
  stage         String   @default("연습생")
  week          Int      @default(1)
  energy        Int      @default(5)
  energyResetAt DateTime?
  currentSceneId String  @default("ch1_intro")
  flagsJson     Json     @default("{}")
  choiceHistory String[] @default([])
  conceptBoardJson Json  @default("{}")
  playtimeMinutes Int    @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])
}

// User 모델에 관계 추가
// idolGameSaves IdolGameSave[]
```

---

## 5. 게임 설정 플로우 (새 게임 시작)

### Step 1: 그룹 기본 정보

**UI 구성:**
- 화면 상단: "당신의 아이돌 그룹을 만들어보세요" 타이틀 (serif 폰트)
- 그룹명 입력 필드 (placeholder: "그룹명을 입력하세요", 최대 20자)
- 그룹 유형 선택 카드 3개 (가로 배열):
  - "걸그룹" / "보이그룹" / "혼성 그룹"
  - 선택 시 카드 강조 (보라색 테두리)
- 인원 수 선택 (2~9, 클릭 버튼):
  - 마이너스 / 숫자(크게) / 플러스 버튼
- 데뷔 컨셉 카드 5개 (2열 그리드):
  - "다크 & 카리스마" (설명: 강렬한 퍼포먼스, 세계관 중심)
  - "청량 & 성장형" (설명: 풋풋함, 팬과 함께 성장)
  - "감성 아티스트형" (설명: 음악성, 깊은 팬층)
  - "큐트 & 발랄" (설명: 중독성, 대중 친화적)
  - "실험적 & 독창적" (설명: 화제성, 고위험 고수익)
- [다음] 버튼 (그룹명 + 유형 + 인원 + 컨셉 모두 선택 시 활성화)

### Step 2: 멤버 성별 배정

**UI 구성:**
- "멤버들의 성별을 배정해주세요" 타이틀
- 인원 수만큼 멤버 카드 배열 (3열 그리드)
- 각 멤버 카드:
  - 상단: "멤버 N" 텍스트
  - 중앙: VRMViewer 컴포넌트 (현재 성별 모델 표시, 높이 120px)
  - 하단: [여성] [남성] 토글 버튼
- 걸그룹 / 보이그룹 선택 시: 토글 버튼 비활성화 + "그룹 유형에 따라 자동 설정됨" 안내
- 혼성 그룹 선택 시: 개별 토글 가능
- [다음] 버튼

### Step 3: 멤버 이름 입력

**UI 구성:**
- "멤버들의 이름(예명)을 입력해주세요" 타이틀
- 인원 수만큼 입력 행 (아이콘 + 이름 + 성별 표시)
  - 각 행: 순번 / 성별 아이콘 (lucide: User / UserRound) / 이름 입력 필드
  - placeholder: "멤버 N" (빈칸이면 이 값으로 저장)
- [다음] 버튼

### Step 4: 설정 확인

**UI 구성:**
- "이제 시작할 준비가 됐어요" 타이틀
- 요약 카드:
  - 그룹명 (대형 serif 폰트)
  - 유형 배지 + 컨셉 배지
  - 멤버 목록 (이름 + 성별 아이콘 가로 나열)
- 하단: [수정하기] (Step 1로 돌아감) / [게임 시작] (저장 후 play로 이동)

---

## 6. VRM 캐릭터 시스템

### VRMViewer 컴포넌트 구현

```typescript
// components/idol-game/VRMViewer.tsx
// @pixiv/three-vrm 사용
// props:
//   gender: 'female' | 'male'
//   customImageUrl?: string   // 버추얼 스튜디오 커스터마이징 후 이미지
//   isActive?: boolean        // 현재 발화 중인 멤버
//   isDancing?: boolean       // 무대/공연 씬
//   scale?: number            // 기본 1.0
//   width?: number            // px, 기본 80
//   height?: number           // px, 기본 140

// 1. customImageUrl이 있으면 VRM 대신 img 태그로 표시
// 2. 없으면 Three.js Canvas로 VRM 렌더링
//    - 모델 경로: /models/female_casual.vrm 또는 /models/male_casual.vrm
//    - 카메라: 정면 고정, 전신이 보이도록
//    - 배경: 투명 (alpha: true)
// 3. 로딩 중: CSS 뼈대 실루엣 표시
// 4. 로드 실패: CSS로 만든 기본 캐릭터 실루엣 (원 + 사각형)
// 5. isActive: 미세한 상하 부유 애니메이션 추가
// 6. isDancing: 빠른 상하 바운스 + 좌우 회전 애니메이션
```

### 캐릭터 배치 규칙

인원 수에 따라 씬 캐릭터 영역에서 자동 배치:

| 인원 수 | 배치 방식 |
|---------|----------|
| 2명 | 중앙 좌우 균등 간격 |
| 3명 | 중앙 1명 + 좌우 각 1명 |
| 4명 | 2열 2명씩 |
| 5명 | 중앙 1명 + 좌우 2명씩 |
| 6~9명 | 전체 균등 간격, 크기 자동 축소 |

활성 멤버 결정 규칙:
- 씬 데이터의 `activeMemberIndex` 필드 값
- -1이면 전체 동일 상태 (중요 장면, 전체 무대)
- 공연/댄스 씬: `isDancing: true` 설정 시 전원 댄스 애니메이션

---

## 7. 씬 엔진 & 대화 시스템

### SceneData 처리 흐름

```
goToScene(sceneId)
  -> 전환 오버레이 fade in (0.35s)
  -> 배경 이미지 교체
  -> VRM 캐릭터 상태 업데이트 (활성/비활성/댄스)
  -> 씬 타이틀 플래시 (titleFlash 필드 있으면)
  -> 스포트라이트 표시 여부 업데이트
  -> 전환 오버레이 fade out (0.35s)
  -> 타이핑 효과 시작 (22ms/글자)
  -> 타이핑 완료 후:
     -> choices 있으면 선택지 표시
     -> nextSceneId 있으면 "다음" 버튼 표시
     -> isResult: true면 ResultCard 표시
     -> isEnding: true면 EndingCard 표시

선택지 클릭 시:
  -> 선택지 UI 즉시 숨김
  -> effect 적용 (스탯 변화)
  -> 스탯 변화 팝업 표시
  -> choiceHistory에 선택 기록
  -> flags 업데이트 (setFlags 있으면)
  -> 에너지 소비 (energyCost 필드, 기본 1)
  -> DB 세이브 (비동기, 화면 블로킹 없음)
  -> "저장됨" 토스트 표시
  -> goToScene(choice.nextSceneId)
```

### 에너지 시스템

```
에너지 최대치: 5 (무료) / 10 (Pro)
에너지 초기화: 매일 자정 (서버 기준 KST)
에너지 0일 때 선택지 클릭 시:
  -> "오늘 에너지를 모두 사용했어요." 모달
  -> "내일 다시 돌아오면 에너지가 충전돼요."
  -> [팬 유니버스 구경하기] / [닫기] 버튼
Pro 사용자: "Pro 멤버는 에너지가 2배예요." 배지 표시
```

---

## 8. 씬 스크립트 JSON 포맷

```typescript
interface SceneData {
  id: string                     // 고유 씬 ID
  chapter: number                // 1~5 + 엔딩(6)
  bg: string                     // 배경 이미지 키 (아래 에셋 목록 참고)
  spotlight?: boolean            // 스포트라이트 효과 여부
  titleFlash?: string            // 씬 진입 시 화면 중앙 타이틀 텍스트
  speaker: string                // 발화자 이름 ("내레이터" | "시스템" | 멤버이름 | NPC이름)
  text: string                   // 대사 (줄바꿈: \n)
  activeMemberIndex?: number     // 활성 멤버 인덱스 (-1: 전체)
  visibleMembers?: number[]      // 표시할 멤버 인덱스 배열 (생략 시 전체)
  isDancing?: boolean            // 댄스 애니메이션 여부
  choices?: ChoiceData[]         // 선택지 배열 (없으면 단순 진행)
  nextSceneId?: string           // 선택지 없을 때 다음 씬
  isResult?: boolean             // 결과 카드 표시 여부
  resultData?: ResultData        // isResult: true일 때 데이터
  isEnding?: boolean             // 엔딩 카드 여부
  endingData?: EndingData        // isEnding: true일 때 데이터
  showVirtualStudioBtn?: boolean // 버추얼 스튜디오 버튼 표시
  showConceptStudioBtn?: boolean // 컨셉 스튜디오 버튼 표시
  requiredFlag?: string          // 이 씬 진입 조건 플래그
  energyCost?: number            // 이 씬의 에너지 소비 (기본 0, 선택지 있으면 1)
}

interface ChoiceData {
  text: string                   // 선택지 텍스트
  subText?: string               // 부가 설명 (선택지 아래 소형 텍스트)
  bonusLabel?: string            // 보너스 배지 텍스트 (예: "+댄스 보너스")
  isCamera?: boolean             // 카메라 댄스 선택지 여부
  effect?: StatEffect            // 스탯 변화
  nextSceneId: string            // 다음 씬 ID
  setFlags?: Record<string, boolean>  // 이 선택으로 설정되는 플래그
}

interface StatEffect {
  vocal?: number
  dance?: number
  charm?: number
  mental?: number
}

interface ResultData {
  title: string                  // 결과 제목
  description: string            // 결과 설명
  stageUp?: string               // 단계 상승 (있으면 stage 업데이트)
  weekAdvance?: number           // 주차 진행 (기본 2)
  unlockFlag?: string            // 해금 플래그
}

interface EndingData {
  type: 'legend' | 'award' | 'global' | 'crisis'
  title: string
  description: string
  finalStats: boolean            // 최종 스탯 표시 여부
  unlockedRoutes?: string[]      // 2회차 해금 루트
  shareCardText: string          // 팬 유니버스 공유 카드 텍스트
}
```

---

## 9. 배경 이미지 에셋 목록

아래 이미지들을 AI로 미리 생성하여 `/public/backgrounds/idol-game/` 에 저장.
씬 스크립트의 `bg` 필드에서 키 이름으로 참조.

| 키 이름 | 파일명 | 분위기 | 사용 씬 |
|--------|--------|--------|---------|
| `practice` | practice_room.jpg | 넓은 연습실, 거울 벽, 낮 | 훈련 씬 전반 |
| `practice_night` | practice_room_night.jpg | 연습실, 야간 조명 | 야간 훈련, 위기 씬 |
| `dorm` | dorm_room.jpg | 아이돌 숙소 방, 침대들 | 숙소 이벤트 씬 |
| `dorm_night` | dorm_room_night.jpg | 숙소 야간, 창문 달빛 | 멤버 대화 씬 |
| `conference` | conference_room.jpg | 기획사 회의실, 화이트보드 | 기획/결정 씬 |
| `eval_hall` | evaluation_hall.jpg | 심사장, 심사위원 테이블 | 월말 평가 씬 |
| `backstage` | backstage.jpg | 백스테이지, 분장대 | 무대 준비 씬 |
| `music_show` | music_show_stage.jpg | 음악방송 무대, 화려한 조명 | 방송 무대 씬 |
| `concert` | concert_stage.jpg | 대형 콘서트 무대, 관객 | 콘서트 씬 |
| `debut_stage` | debut_stage.jpg | 데뷔 무대, 스포트라이트 | 데뷔 씬 |
| `recording` | recording_studio.jpg | 녹음실, 마이크, 방음벽 | 앨범 작업 씬 |
| `photo_studio` | photo_studio.jpg | 화보 촬영장, 흰 배경 | 화보/티저 씬 |
| `airport` | airport.jpg | 공항 출국장 | 해외 진출 씬 |
| `overseas` | overseas_stage.jpg | 해외 대형 페스티벌 무대 | 글로벌 루트 씬 |
| `award` | award_ceremony.jpg | 시상식장, 레드카펫 | 시상식 씬 |
| `award_win` | award_ceremony_win.jpg | 시상식 수상 순간, 트로피 | 대상 수상 엔딩 |
| `rooftop` | rooftop_night.jpg | 도심 옥상, 야경, 바람 | 감성 대화 씬 |
| `press` | press_conference.jpg | 기자회견장 | 데뷔 발표 씬 |
| `sns_viral` | sns_viral_bg.jpg | 스마트폰 화면들 콜라주 | 바이럴 이벤트 씬 |
| `crisis_stage` | crisis_empty_stage.jpg | 텅 빈 무대, 어두운 조명 | 위기 루트 씬 |

---

## 10. 전체 씬 스크립트 & 스토리

> 모든 씬에서 이모티콘(emoji) 사용 금지.
> speaker, text, 선택지 텍스트에 이모티콘 없음.
> 감정 표현은 텍스트와 연출(배경, 캐릭터 상태)로만 처리.

---

### Chapter 1: 결성 (Week 1~2)

#### ch1_intro
```json
{
  "id": "ch1_intro",
  "chapter": 1,
  "bg": "conference",
  "titleFlash": "Chapter 1 — 결성",
  "speaker": "내레이터",
  "text": "당신은 이제 팬이 아니라, 아이돌을 만드는 프로듀서입니다.\n당신의 선택 하나로, 평범한 연습생이 무대 위의 스타가 됩니다.\n이곳은 경쟁이 치열한 K-POP 업계. 살아남는 건 단 하나의 팀뿐입니다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch1_first_look"
}
```

#### ch1_first_look
```json
{
  "id": "ch1_first_look",
  "chapter": 1,
  "bg": "practice",
  "speaker": "매니저 박 팀장",
  "text": "프로듀서님, 드디어 팀이 결성됐습니다.\n아직 아무것도 정해진 게 없어요. 실력도, 컨셉도, 팬덤도.\n하지만 한 가지는 확실합니다. 이 아이들에겐 가능성이 있어요.\n앞으로 함께 만들어 나가는 겁니다.",
  "activeMemberIndex": -1,
  "showVirtualStudioBtn": true,
  "nextSceneId": "ch1_virtual_studio_prompt"
}
```

#### ch1_virtual_studio_prompt
```json
{
  "id": "ch1_virtual_studio_prompt",
  "chapter": 1,
  "bg": "practice",
  "speaker": "매니저 박 팀장",
  "text": "지금 멤버들의 비주얼이 아직 정해지지 않았어요.\n버추얼 스튜디오에서 멤버들의 모습을 직접 만들어볼 수 있습니다.\n지금 하시겠어요? 나중에 언제든지 할 수 있으니 천천히 결정하세요.",
  "activeMemberIndex": -1,
  "showVirtualStudioBtn": true,
  "choices": [
    {
      "text": "지금 바로 멤버 비주얼을 만들어본다",
      "subText": "버추얼 스튜디오로 연결 (언제든 수정 가능)",
      "effect": { "charm": 3 },
      "nextSceneId": "ch1_week1_choice"
    },
    {
      "text": "일단 훈련부터 시작한다",
      "subText": "나중에 커스터마이징 가능",
      "effect": {},
      "nextSceneId": "ch1_week1_choice"
    }
  ]
}
```

#### ch1_week1_choice
```json
{
  "id": "ch1_week1_choice",
  "chapter": 1,
  "bg": "practice",
  "speaker": "매니저 박 팀장",
  "text": "첫 월말 평가가 3주 후입니다.\n이 평가 결과에 따라 데뷔조 진입 여부가 결정돼요.\n어떤 훈련에 집중할까요?",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "보컬 집중 트레이닝",
      "subText": "안정적인 실력 확보, 개성 부족 위험",
      "effect": { "vocal": 12, "dance": -2, "charm": 2, "mental": 3 },
      "nextSceneId": "ch1_vocal_training"
    },
    {
      "text": "퍼포먼스 강화 훈련",
      "subText": "무대 임팩트 상승, 체력 소모 큼",
      "effect": { "vocal": -2, "dance": 12, "charm": 4, "mental": -8 },
      "nextSceneId": "ch1_dance_training"
    },
    {
      "text": "컨셉 몰입 훈련 (표정, 연기)",
      "subText": "팬 반응 상승, 실력 성장은 느림",
      "effect": { "vocal": 0, "dance": 2, "charm": 10, "mental": 5 },
      "nextSceneId": "ch1_concept_training"
    },
    {
      "text": "팀워크 강화 캠프",
      "subText": "멘탈 + 팀 시너지 상승, 직접 실력 변화 적음",
      "effect": { "vocal": 4, "dance": 4, "charm": 4, "mental": 12 },
      "nextSceneId": "ch1_teamwork_training"
    }
  ]
}
```

#### ch1_vocal_training
```json
{
  "id": "ch1_vocal_training",
  "chapter": 1,
  "bg": "recording",
  "speaker": "보컬 트레이너",
  "text": "발성부터 다시 잡아야 합니다. 기초가 무너지면 나중에 더 힘들어요.\n\n연습실의 피아노 소리가 끊이지 않는다.\n매일 새벽까지 같은 소절을 반복한다.\n\n\"음색이 정말 깊어졌네요.\" 트레이너가 말했다.",
  "activeMemberIndex": 0,
  "nextSceneId": "ch1_random_event"
}
```

#### ch1_dance_training
```json
{
  "id": "ch1_dance_training",
  "chapter": 1,
  "bg": "practice_night",
  "speaker": "내레이터",
  "text": "연습실의 불이 꺼지지 않는다. 하루 10시간 이상 안무를 반복한다.\n처음엔 엇박자가 나고, 체력도 한계에 부딪혔다.\n\n하지만 점점 동선이 맞기 시작하고, 무대 장악력이 눈에 띄게 상승한다.\n\n이 속도라면... 평가까지 뭔가 보여줄 수 있을 것 같다.",
  "activeMemberIndex": 1,
  "nextSceneId": "ch1_mental_crisis"
}
```

#### ch1_concept_training
```json
{
  "id": "ch1_concept_training",
  "chapter": 1,
  "bg": "photo_studio",
  "speaker": "이미지 디렉터",
  "text": "거울 앞에서 표정 연기를 반복하는 멤버들.\n단순히 예쁜 게 아니라, 카메라가 잡아내는 '순간'을 만들어야 해요.\n\n사람을 끌어당기는 감정의 표현. 그게 팬들이 기억하는 장면이 됩니다.",
  "activeMemberIndex": 2,
  "nextSceneId": "ch1_random_event"
}
```

#### ch1_teamwork_training
```json
{
  "id": "ch1_teamwork_training",
  "chapter": 1,
  "bg": "dorm_night",
  "speaker": "내레이터",
  "text": "숙소에서 밤새 이야기를 나눈 멤버들.\n눈물도 있었고, 웃음도 있었다.\n\n\"우리 꼭 같이 데뷔하자.\"\n\n그 말 하나가 팀의 방향을 바꿨다.\n지금은 실력보다, 서로를 믿는 힘이 더 중요하다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch1_random_event"
}
```

#### ch1_mental_crisis
```json
{
  "id": "ch1_mental_crisis",
  "chapter": 1,
  "bg": "practice_night",
  "speaker": "멤버 (첫 번째)",
  "text": "(연습 도중 한 멤버가 눈물을 보였다)\n\n\"너무 힘들어서... 못 버틸 것 같아.\"\n\n팀 분위기가 흔들린다.\n이 위기를 어떻게 넘길 것인가?",
  "activeMemberIndex": 0,
  "energyCost": 1,
  "choices": [
    {
      "text": "진심 어린 팀 미팅을 진행한다",
      "subText": "멘탈 회복 + 팀워크 상승",
      "effect": { "mental": 10, "charm": 3 },
      "nextSceneId": "ch1_random_event"
    },
    {
      "text": "감정을 무대 에너지로 승화시킨다",
      "subText": "눈물을 표정 연기로 활용",
      "effect": { "charm": 14, "mental": 8, "dance": 2 },
      "setFlags": { "emotional_performance": true },
      "nextSceneId": "ch1_random_event"
    },
    {
      "text": "하루 전체 휴식을 선언한다",
      "subText": "멘탈 크게 회복, 평가 준비 부족",
      "effect": { "mental": 15, "dance": -3 },
      "nextSceneId": "ch1_random_event"
    },
    {
      "text": "강행 훈련을 지속한다",
      "subText": "퍼포먼스 완성도 극대화, 멘탈 붕괴 위험",
      "effect": { "dance": 6, "mental": -12 },
      "nextSceneId": "ch1_random_event"
    }
  ]
}
```

#### ch1_random_event
```json
{
  "id": "ch1_random_event",
  "chapter": 1,
  "bg": "dorm",
  "speaker": "매니저 박 팀장",
  "text": "훈련 중에 뜻밖의 일이 생겼습니다.\n\n연습 영상 하나가 직원 커뮤니티에서 화제가 됐어요.\n'이 그룹 언제 데뷔해요?' 라는 반응이 달렸습니다.\n아직 데뷔도 안 했는데, 기대감이 생기고 있어요.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch1_eval_notice"
}
```

#### ch1_eval_notice
```json
{
  "id": "ch1_eval_notice",
  "chapter": 1,
  "bg": "conference",
  "speaker": "매니저 박 팀장",
  "text": "내일이 월말 평가입니다.\n\n심사위원들이 직접 와서 퍼포먼스를 봅니다.\n이 평가 결과가 데뷔조 진입 여부를 결정해요.\n\n마지막 준비 방향을 정해주세요.",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "라이브 안정형 무대로 간다",
      "subText": "실력으로 인정받는다",
      "effect": { "vocal": 3 },
      "nextSceneId": "ch1_eval_stage"
    },
    {
      "text": "퍼포먼스 임팩트 극대화",
      "subText": "무대 장악, 실수 위험 있음",
      "effect": { "dance": 3, "mental": -3 },
      "nextSceneId": "ch1_eval_stage"
    },
    {
      "text": "팬서비스 집중 무대",
      "subText": "표정과 눈맞춤, 직캠 의식",
      "effect": { "charm": 5 },
      "nextSceneId": "ch1_eval_stage"
    },
    {
      "text": "직접 무대에서 춤춰보기",
      "subText": "참여만 해도 댄스 보너스 +15",
      "isCamera": true,
      "bonusLabel": "+댄스 보너스",
      "effect": { "dance": 15, "charm": 5 },
      "nextSceneId": "ch1_eval_result"
    }
  ]
}
```

#### ch1_eval_stage
```json
{
  "id": "ch1_eval_stage",
  "chapter": 1,
  "bg": "eval_hall",
  "speaker": "심사위원",
  "text": "\"퍼포먼스... 예상 이상이네요.\"\n\n\"특히 표정, 눈에 남습니다.\"\n\n잠시 정적이 흘렀다.\n\n결과를 발표합니다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch1_eval_result"
}
```

#### ch1_eval_result
```json
{
  "id": "ch1_eval_result",
  "chapter": 1,
  "bg": "eval_hall",
  "speaker": "심사위원",
  "text": "\"데뷔조 진입 명단을 발표합니다.\"\n\n...\n\n합격입니다.",
  "activeMemberIndex": -1,
  "isResult": true,
  "resultData": {
    "title": "데뷔조 진입 성공",
    "description": "심사위원들의 눈길을 사로잡았습니다. 연습생 단계를 통과했어요. 이제 진짜 데뷔를 준비할 차례입니다.",
    "stageUp": "데뷔조",
    "weekAdvance": 2,
    "unlockFlag": "debut_candidate"
  }
}
```

---

### Chapter 2: 훈련 (Week 3~6)

#### ch2_debut_prep
```json
{
  "id": "ch2_debut_prep",
  "chapter": 2,
  "bg": "conference",
  "titleFlash": "Chapter 2 — 데뷔 준비",
  "speaker": "매니저 박 팀장",
  "text": "데뷔조 진입을 축하합니다. 하지만 여기서 끝이 아닙니다.\n이제부터가 진짜 시작이에요.\n\n데뷔곡 방향을 먼저 결정해야 합니다. 이 선택이 앞으로의 이미지를 결정합니다.",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "청량 중독성 곡 (대중 장악)",
      "subText": "대중성 높음, 빠른 팬 유입",
      "effect": { "charm": 8, "vocal": 3 },
      "setFlags": { "concept_bright": true },
      "nextSceneId": "ch2_concept_bright"
    },
    {
      "text": "감성 성장 스토리 곡",
      "subText": "깊은 팬층 확보, 초반 성적 불안정",
      "effect": { "vocal": 10, "mental": 5 },
      "setFlags": { "concept_emotional": true },
      "nextSceneId": "ch2_concept_emotional"
    },
    {
      "text": "퍼포먼스 중심 강렬한 곡",
      "subText": "무대 화제성 폭발, 컨셉 충돌 가능",
      "effect": { "dance": 10, "charm": 4 },
      "setFlags": { "concept_powerful": true },
      "nextSceneId": "ch2_concept_powerful"
    },
    {
      "text": "하이브리드 (청량 + 감성 믹스)",
      "subText": "리스크 있지만 성공 시 강력",
      "effect": { "vocal": 5, "dance": 5, "charm": 5 },
      "setFlags": { "concept_hybrid": true },
      "nextSceneId": "ch2_concept_hybrid"
    }
  ]
}
```

#### ch2_concept_bright
```json
{
  "id": "ch2_concept_bright",
  "chapter": 2,
  "bg": "photo_studio",
  "speaker": "음악 감독",
  "text": "밝고 통통 튀는 비트. 한 번 들으면 잊히지 않는 후렴.\n\n티저 공개 직후 반응이 터졌습니다.\n\"누구야 저 그룹?\" 검색량이 급증했어요.\n안무 챌린지 가능성도 포착됐습니다.\n\n초반 화제성 확보, 성공적입니다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch2_concept_studio_prompt"
}
```

#### ch2_concept_emotional
```json
{
  "id": "ch2_concept_emotional",
  "chapter": 2,
  "bg": "recording",
  "speaker": "음악 감독",
  "text": "서두르지 않기로 했다.\n\n가사 하나하나에 멤버들의 실제 이야기를 담았습니다.\n처음엔 반응이 조용했지만, 한 명, 두 명 팬들이 늘기 시작했습니다.\n\n\"이 그룹, 노래가 진짜네.\" 라는 말이 퍼지기 시작했어요.",
  "activeMemberIndex": 0,
  "nextSceneId": "ch2_concept_studio_prompt"
}
```

#### ch2_concept_powerful
```json
{
  "id": "ch2_concept_powerful",
  "chapter": 2,
  "bg": "backstage",
  "speaker": "퍼포먼스 감독",
  "text": "무대를 장악하는 팀이 되려면, 압도적인 퍼포먼스 하나가 있어야 해요.\n\n강렬한 비트, 칼군무, 눈을 뗄 수 없는 동선.\n\n연습실에서 나올 때부터 달랐습니다. 뭔가 바뀌었어요.",
  "activeMemberIndex": 1,
  "nextSceneId": "ch2_concept_studio_prompt"
}
```

#### ch2_concept_hybrid
```json
{
  "id": "ch2_concept_hybrid",
  "chapter": 2,
  "bg": "conference",
  "speaker": "음악 감독",
  "text": "두 가지를 동시에 잡겠다는 건 쉬운 길이 아닙니다.\n\n하지만 성공한다면, 어떤 팬층도 거부감 없이 들어올 수 있는 그룹이 돼요.\n\n리스크는 있지만, 당신의 선택이라면 해보겠습니다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch2_concept_studio_prompt"
}
```

#### ch2_concept_studio_prompt
```json
{
  "id": "ch2_concept_studio_prompt",
  "chapter": 2,
  "bg": "conference",
  "speaker": "아트 디렉터",
  "text": "이제 비주얼 방향도 잡아야 해요.\n로고, 앨범 커버, 팀 컬러... 이게 그룹의 첫 인상이 됩니다.\n\n컨셉 스튜디오에서 직접 만들어보시겠어요?\n지금 만들어두면 이후 모든 씬에 반영됩니다.",
  "activeMemberIndex": -1,
  "showConceptStudioBtn": true,
  "choices": [
    {
      "text": "지금 바로 컨셉 키트를 제작한다",
      "subText": "컨셉 스튜디오 연동 (로고 + 앨범커버 생성)",
      "effect": { "charm": 5 },
      "nextSceneId": "ch2_rival_appear"
    },
    {
      "text": "나중에 한다, 훈련이 먼저다",
      "subText": "컨셉 보드 빈칸으로 진행",
      "effect": {},
      "nextSceneId": "ch2_rival_appear"
    }
  ]
}
```

#### ch2_rival_appear
```json
{
  "id": "ch2_rival_appear",
  "chapter": 2,
  "bg": "backstage",
  "speaker": "매니저 박 팀장",
  "text": "같은 날 데뷔하는 경쟁 그룹이 나타났습니다.\n\n대형 기획사 소속. 예산도 다르고, 경력도 다릅니다.\n\n미디어는 이미 그 팀을 \"압도적 신인 후보\"로 부르고 있어요.\n\n어떻게 대응하시겠어요?",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "신경 끄고 우리 것에만 집중한다",
      "subText": "멘탈 유지, 흔들리지 않는 루틴",
      "effect": { "mental": 8, "vocal": 4, "dance": 4 },
      "nextSceneId": "ch2_debut_final_prep"
    },
    {
      "text": "라이벌을 분석하고 차별화 전략을 짠다",
      "subText": "컨셉 강화, 시간 소모",
      "effect": { "charm": 10, "mental": -3 },
      "nextSceneId": "ch2_debut_final_prep"
    },
    {
      "text": "맞불을 놓는다 — 더 강하게 밀어붙인다",
      "subText": "단기 임팩트 상승, 멘탈 위험",
      "effect": { "dance": 8, "charm": 5, "mental": -8 },
      "nextSceneId": "ch2_debut_final_prep"
    }
  ]
}
```

#### ch2_debut_final_prep
```json
{
  "id": "ch2_debut_final_prep",
  "chapter": 2,
  "bg": "backstage",
  "speaker": "매니저 박 팀장",
  "text": "데뷔 무대 전날 밤입니다.\n\n연습실에서 마지막 리허설을 마쳤습니다.\n멤버들의 눈빛이 달라졌어요.\n\n내일, 모든 게 시작됩니다.\n\n마지막 전략을 선택해주세요.",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "완벽한 라이브로 실력을 증명한다",
      "subText": "안정적, 임팩트 다소 부족 가능",
      "effect": { "vocal": 5, "charm": 3 },
      "nextSceneId": "ch2_debut_stage"
    },
    {
      "text": "팬서비스 집중 — 직캠 바이럴 노린다",
      "subText": "입덕 유도형 전략",
      "effect": { "charm": 10, "vocal": -1 },
      "nextSceneId": "ch2_debut_stage"
    },
    {
      "text": "퍼포먼스 극한으로 끌어올린다",
      "subText": "무대 장악, 실수 위험",
      "effect": { "dance": 8, "mental": -3 },
      "nextSceneId": "ch2_debut_stage"
    },
    {
      "text": "직접 데뷔 무대를 체험해본다",
      "subText": "카메라 앞에서 직접 춤추기",
      "isCamera": true,
      "bonusLabel": "+댄스 보너스",
      "effect": { "dance": 15, "charm": 8 },
      "nextSceneId": "ch2_debut_result"
    }
  ]
}
```

#### ch2_debut_stage
```json
{
  "id": "ch2_debut_stage",
  "chapter": 2,
  "bg": "debut_stage",
  "spotlight": true,
  "titleFlash": "데뷔 무대",
  "speaker": "내레이터",
  "text": "조명이 켜진다.\n\n음악이 흐른다.\n\n관객들이 숨을 죽인다.\n\n그리고 — 그 순간이 시작된다.",
  "activeMemberIndex": -1,
  "isDancing": true,
  "nextSceneId": "ch2_debut_result"
}
```

#### ch2_debut_result
```json
{
  "id": "ch2_debut_result",
  "chapter": 2,
  "bg": "debut_stage",
  "spotlight": true,
  "speaker": "내레이터",
  "text": "직캠 조회수 폭발. 하루 만에 100만을 넘었습니다.\n\n\"이 그룹 누구야?\" 커뮤니티가 들썩입니다.\n팬덤 초기 형성이 시작됐어요.\n\n입덕 유도형 그룹으로 자리 잡기 시작했습니다.",
  "activeMemberIndex": -1,
  "isResult": true,
  "resultData": {
    "title": "데뷔 성공",
    "description": "첫 무대에서 강렬한 인상을 남겼습니다. 커뮤니티 반응이 뜨겁고, 팬덤이 형성되기 시작했어요. 신인 아이돌로서의 첫 걸음을 내딛었습니다.",
    "stageUp": "신인 아이돌",
    "weekAdvance": 2,
    "unlockFlag": "debut_done"
  }
}
```

---

### Chapter 3: 성장 (Week 7~10)

#### ch3_first_activity
```json
{
  "id": "ch3_first_activity",
  "chapter": 3,
  "bg": "music_show",
  "titleFlash": "Chapter 3 — 첫 활동",
  "speaker": "매니저 박 팀장",
  "text": "드디어 음악방송 무대에 섭니다.\n\n1위 후보에 오르진 못했지만, 이름을 알리기 시작했어요.\n이제 어떤 방향으로 첫 활동을 이어나갈지 결정해야 합니다.",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "후속곡을 빠르게 컴백 준비한다",
      "subText": "기세 유지, 완성도 위험",
      "effect": { "charm": 6, "mental": -4 },
      "nextSceneId": "ch3_sns_viral"
    },
    {
      "text": "예능 출연에 집중한다",
      "subText": "대중 인지도 폭발 상승",
      "effect": { "charm": 12, "vocal": -2 },
      "setFlags": { "variety_done": true },
      "nextSceneId": "ch3_variety_result"
    },
    {
      "text": "라이브 실력을 먼저 강화한다",
      "subText": "실력파 이미지 구축, 장기적 유리",
      "effect": { "vocal": 12, "dance": 6, "mental": 4 },
      "nextSceneId": "ch3_sns_viral"
    },
    {
      "text": "SNS와 챌린지 공략에 집중한다",
      "subText": "바이럴 극대화, 팬 급증 가능",
      "effect": { "charm": 10, "dance": 5 },
      "setFlags": { "viral_challenge": true },
      "nextSceneId": "ch3_sns_viral"
    }
  ]
}
```

#### ch3_variety_result
```json
{
  "id": "ch3_variety_result",
  "chapter": 3,
  "bg": "backstage",
  "speaker": "매니저 박 팀장",
  "text": "예능 방송 출연 결과입니다.\n\n방송에서 멤버 한 명의 리액션이 화제가 됐습니다.\n\"저 애 누구야?\" 검색량이 치솟았어요.\n\n개인 팬덤이 생기기 시작했지만, 팀 전체 활동과 균형을 맞추는 게 중요합니다.",
  "activeMemberIndex": 2,
  "nextSceneId": "ch3_sns_viral"
}
```

#### ch3_sns_viral
```json
{
  "id": "ch3_sns_viral",
  "chapter": 3,
  "bg": "sns_viral",
  "speaker": "내레이터",
  "text": "안무 챌린지 영상이 올라갔다.\n\n일반인들이 따라 추기 시작했습니다. 인플루언서들도 참여했어요.\n\n그리고 — 한 영상이 완전히 터졌습니다.\n\n\"중독됨\", \"안무 너무 귀엽다\" 댓글이 폭발했어요.\n음원 차트 역주행 조짐이 보이기 시작했습니다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch3_chart_battle"
}
```

#### ch3_chart_battle
```json
{
  "id": "ch3_chart_battle",
  "chapter": 3,
  "bg": "music_show",
  "speaker": "매니저 박 팀장",
  "text": "드디어 음악방송 1위 후보에 처음으로 이름이 올라갔습니다.\n\n상대는 이미 자리를 잡은 인기 그룹입니다.\n\n1위를 노려볼 수 있는 무대 전략을 세워야 해요.",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "완벽한 라이브로 실력 승부",
      "subText": "안정적, 팬들의 신뢰 상승",
      "effect": { "vocal": 5, "mental": 4 },
      "nextSceneId": "ch3_first_win"
    },
    {
      "text": "퍼포먼스 극한으로 끌어올린다",
      "subText": "무대 압도, 실수 위험",
      "effect": { "dance": 6, "charm": 3, "mental": -4 },
      "nextSceneId": "ch3_first_win"
    },
    {
      "text": "팬과의 교감 중심 무대",
      "subText": "투표 화력 극대화",
      "effect": { "charm": 8, "mental": 5 },
      "nextSceneId": "ch3_first_win"
    },
    {
      "text": "스토리 연출 무대 (감정 + 연기)",
      "subText": "전설급 무대 가능, 고난도",
      "effect": { "charm": 12, "vocal": 4, "mental": -5 },
      "setFlags": { "legendary_stage": true },
      "nextSceneId": "ch3_first_win"
    }
  ]
}
```

#### ch3_first_win
```json
{
  "id": "ch3_first_win",
  "chapter": 3,
  "bg": "music_show",
  "spotlight": true,
  "titleFlash": "첫 1위",
  "speaker": "MC",
  "text": "\"1위는...\"\n\n...\n\n...\n\n\"축하합니다!\"\n\n멤버들은 울면서 서로를 끌어안는다.\n팬들도 함께 울고 있다.\n\n이 순간이 — 처음이자 전부였다.",
  "activeMemberIndex": -1,
  "isDancing": false,
  "isResult": true,
  "resultData": {
    "title": "첫 음악방송 1위 달성",
    "description": "팬들과 함께 만들어낸 첫 1위. 멤버들은 눈물을 흘렸고, 팬덤 결속력이 크게 높아졌어요. 이제 인기 아이돌로서의 본격적인 여정이 시작됩니다.",
    "stageUp": "인기 아이돌",
    "weekAdvance": 2,
    "unlockFlag": "first_win"
  }
}
```

---

### Chapter 4: 정상 도전 (Week 11~16)

#### ch4_rising_status
```json
{
  "id": "ch4_rising_status",
  "chapter": 4,
  "bg": "conference",
  "titleFlash": "Chapter 4 — 정상으로",
  "speaker": "매니저 박 팀장",
  "text": "이제 \"떠오르는 그룹\"이 아니라, 지켜야 하는 위치에 있습니다.\n\n해외 팬들의 반응이 심상치 않아요.\n\n그리고 대형 결정이 기다리고 있습니다.\n\n지금이 갈림길입니다.",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "해외 진출 (글로벌 활동 시작)",
      "subText": "성공 시 대형 그룹 도약, 리스크 큼",
      "effect": { "charm": 8, "mental": -6 },
      "setFlags": { "global_route": true },
      "nextSceneId": "ch4_global_route"
    },
    {
      "text": "정규 앨범 준비",
      "subText": "음악성 강화, 팬덤 깊이 증가",
      "effect": { "vocal": 10, "dance": 4, "mental": 5 },
      "setFlags": { "album_route": true },
      "nextSceneId": "ch4_album_route"
    },
    {
      "text": "전국 투어 콘서트",
      "subText": "팬 결속 극대화, 수익 증가",
      "effect": { "charm": 10, "mental": 5, "dance": 5 },
      "setFlags": { "tour_route": true },
      "nextSceneId": "ch4_tour_route"
    },
    {
      "text": "유닛 / 개인 활동 시작",
      "subText": "멤버 개별 인기 상승, 팀 균형 흔들림 위험",
      "effect": { "charm": 12, "mental": -5 },
      "setFlags": { "unit_route": true },
      "nextSceneId": "ch4_unit_route"
    }
  ]
}
```

#### ch4_global_route
```json
{
  "id": "ch4_global_route",
  "chapter": 4,
  "bg": "airport",
  "speaker": "내레이터",
  "text": "해외 일정이 잡혔습니다.\n\n처음 밟는 해외 땅. 낯선 언어, 낯선 관중.\n\n하지만 음악에는 언어가 없습니다.\n\n공항에서 팬들이 기다리고 있었습니다. 생각보다 훨씬 많이.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch4_global_sync_prompt"
}
```

#### ch4_global_sync_prompt
```json
{
  "id": "ch4_global_sync_prompt",
  "chapter": 4,
  "bg": "airport",
  "speaker": "글로벌 매니저",
  "text": "해외 팬들을 위한 콘텐츠가 필요합니다.\n글로벌 싱크 기능으로 팀 소개 영상에 다국어 자막을 만들 수 있어요.\n\n자막을 완성하면 해외 팬덤 수치가 크게 오릅니다.",
  "activeMemberIndex": -1,
  "choices": [
    {
      "text": "글로벌 싱크로 자막을 만든다",
      "subText": "팬메이커 글로벌 싱크 연동",
      "effect": { "charm": 10 },
      "setFlags": { "global_sync_done": true },
      "nextSceneId": "ch4_overseas_stage"
    },
    {
      "text": "일단 무대부터 집중한다",
      "subText": "나중에 글로벌 싱크 가능",
      "effect": {},
      "nextSceneId": "ch4_overseas_stage"
    }
  ]
}
```

#### ch4_overseas_stage
```json
{
  "id": "ch4_overseas_stage",
  "chapter": 4,
  "bg": "overseas",
  "spotlight": true,
  "titleFlash": "해외 무대",
  "speaker": "내레이터",
  "text": "해외 페스티벌 무대.\n\n수천 명의 관중. 다들 처음 보는 얼굴들이지만, 노래를 알고 있었다.\n\n후렴구에서 관중이 같이 따라 불렀다.\n\n그 순간 — 국경은 없었다.",
  "activeMemberIndex": -1,
  "isDancing": true,
  "nextSceneId": "ch4_top_choice"
}
```

#### ch4_album_route
```json
{
  "id": "ch4_album_route",
  "chapter": 4,
  "bg": "recording",
  "speaker": "음악 감독",
  "text": "속도를 늦췄습니다.\n\n타이틀곡 + 수록곡 다수 제작. 멤버 참여도 상승.\n컨셉 확장 — 처음보다 훨씬 깊어진 이야기.\n\n연습실이 다시 조용해졌습니다.\n이번엔 버티기가 아니라 완성을 위한 시간입니다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch4_album_title_choice"
}
```

#### ch4_album_title_choice
```json
{
  "id": "ch4_album_title_choice",
  "chapter": 4,
  "bg": "recording",
  "speaker": "음악 감독",
  "text": "정규 앨범 타이틀곡을 최종 선택해야 합니다.\n\n이 선택이 톱스타 진입을 좌우합니다.",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "초대중성 히트곡 (귀에 꽂히는 멜로디)",
      "subText": "차트 1위 가능성 높음, 음악성 논란 가능",
      "effect": { "vocal": 6, "dance": 3, "charm": 8, "mental": 5 },
      "setFlags": { "hit_song": true },
      "nextSceneId": "ch4_album_hit"
    },
    {
      "text": "감성 서사형 타이틀곡",
      "subText": "팬덤 결속 최강, 장기적으로 강함",
      "effect": { "vocal": 12, "charm": 5, "mental": 8 },
      "setFlags": { "emotional_song": true },
      "nextSceneId": "ch4_album_emotional"
    },
    {
      "text": "퍼포먼스 실험곡",
      "subText": "화제성 폭발, 실패 리스크 큼",
      "effect": { "dance": 12, "charm": 6, "mental": -5 },
      "nextSceneId": "ch4_album_hit"
    },
    {
      "text": "완성형 밸런스 곡 (대중성 + 감성 + 퍼포먼스)",
      "subText": "안정적, 임팩트 다소 부족 가능",
      "effect": { "vocal": 6, "dance": 6, "charm": 6, "mental": 6 },
      "nextSceneId": "ch4_album_hit"
    }
  ]
}
```

#### ch4_album_hit
```json
{
  "id": "ch4_album_hit",
  "chapter": 4,
  "bg": "music_show",
  "spotlight": true,
  "speaker": "내레이터",
  "text": "음원 차트 ALL KILL 달성.\n\n음악방송 연속 1위. 길거리, 카페, SNS 전부 이 팀이었습니다.\n\n완벽한 대중 장악 성공.\n\n이제 다음 목표를 향해 나아갈 시간입니다.",
  "activeMemberIndex": -1,
  "isDancing": true,
  "nextSceneId": "ch4_top_choice"
}
```

#### ch4_album_emotional
```json
{
  "id": "ch4_album_emotional",
  "chapter": 4,
  "bg": "concert",
  "spotlight": true,
  "speaker": "내레이터",
  "text": "처음엔 조용했다. 하지만 하나씩, 둘씩.\n\n\"이 노래 들으면 눈물이 나요.\" 라는 댓글이 쌓이기 시작했습니다.\n\n팬들이 이 팀의 이야기에 자신의 이야기를 겹쳐 보기 시작했어요.\n\n단순한 팬덤이 아니라, 진짜 유대감이 형성됐습니다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch4_top_choice"
}
```

#### ch4_tour_route
```json
{
  "id": "ch4_tour_route",
  "chapter": 4,
  "bg": "concert",
  "spotlight": true,
  "titleFlash": "전국 투어",
  "speaker": "내레이터",
  "text": "서울 — 부산 — 대구 — 광주.\n\n전국을 돌며 팬들을 직접 만났습니다.\n\n공연장이 꽉 찼습니다. 소리가 울렸습니다.\n\n\"오늘 진짜 행복했어요.\" 한 팬이 문 앞에서 말했습니다.\n\n이 무대를 위해 여기까지 온 거라는 걸 다시 느꼈습니다.",
  "activeMemberIndex": -1,
  "isDancing": true,
  "nextSceneId": "ch4_top_choice"
}
```

#### ch4_unit_route
```json
{
  "id": "ch4_unit_route",
  "chapter": 4,
  "bg": "backstage",
  "speaker": "매니저 박 팀장",
  "text": "유닛 활동이 시작됐습니다.\n\n개별 멤버들의 인지도가 크게 올랐어요.\n하지만 팀 전체 활동과 개인 일정이 겹치기 시작했습니다.\n\n멤버 간 갈등의 씨앗이 심어지고 있어요.\n\n지금 어떻게 관리하느냐가 중요합니다.",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "팀 전체 일정을 우선시한다",
      "subText": "개인 인지도 일부 포기, 팀 결속 유지",
      "effect": { "mental": 8, "charm": 4 },
      "nextSceneId": "ch4_top_choice"
    },
    {
      "text": "개인 활동도 최대한 밀어준다",
      "subText": "전체 매력 상승, 멘탈 리스크",
      "effect": { "charm": 12, "mental": -8 },
      "nextSceneId": "ch4_top_choice"
    }
  ]
}
```

#### ch4_top_choice
```json
{
  "id": "ch4_top_choice",
  "chapter": 4,
  "bg": "conference",
  "speaker": "매니저 박 팀장",
  "text": "이제 국내 최정상 그룹을 눈앞에 두고 있습니다.\n\n시상식 시즌이 다가왔어요.\n글로벌 러브콜도 들어오고 있습니다.\n\n다음 목표를 결정해주세요. 이 선택이 엔딩을 결정합니다.",
  "activeMemberIndex": -1,
  "energyCost": 1,
  "choices": [
    {
      "text": "월드 투어 & 글로벌 진출",
      "subText": "성공 시 레전드 루트 진입",
      "effect": { "charm": 6, "dance": 4, "mental": -4 },
      "setFlags": { "ending_global": true },
      "nextSceneId": "ch5_global_tour"
    },
    {
      "text": "국내 시상식 올인 (대상을 노린다)",
      "subText": "커리어 정점, 완벽한 왕좌",
      "effect": { "vocal": 5, "dance": 5, "charm": 5 },
      "setFlags": { "ending_award": true },
      "nextSceneId": "ch5_award_prep"
    },
    {
      "text": "멤버 솔로 데뷔 프로젝트",
      "subText": "개별 슈퍼스타 탄생 가능",
      "effect": { "charm": 10, "mental": -4 },
      "setFlags": { "ending_solo": true },
      "nextSceneId": "ch5_solo_project"
    },
    {
      "text": "무리한 활동 강행 (초고속 확장)",
      "subText": "성공 시 신화 / 실패 시 위기 루트",
      "effect": { "charm": 8, "mental": -15 },
      "setFlags": { "ending_risk": true },
      "nextSceneId": "ch5_risk_route"
    }
  ]
}
```

---

### Chapter 5: 엔딩 분기 (Week 17~20)

#### ch5_global_tour
```json
{
  "id": "ch5_global_tour",
  "chapter": 5,
  "bg": "overseas",
  "spotlight": true,
  "titleFlash": "Chapter 5 — 글로벌",
  "speaker": "내레이터",
  "text": "미국 — 일본 — 유럽 — 동남아시아.\n\n각국의 팬들이 노래를 알고 있었습니다.\n언어는 달랐지만, 음악이 연결했습니다.\n\n마지막 공연장 — 수만 명 앞에서.\n\n이것이 K-POP이다, 라고 세계가 말하기 시작했습니다.",
  "activeMemberIndex": -1,
  "isDancing": true,
  "nextSceneId": "ending_global"
}
```

#### ch5_award_prep
```json
{
  "id": "ch5_award_prep",
  "chapter": 5,
  "bg": "backstage",
  "titleFlash": "Chapter 5 — 시상식",
  "speaker": "매니저 박 팀장",
  "text": "시상식 시즌입니다.\n\n무대 퀄리티를 극한으로 끌어올렸습니다.\n라이브 완성도 최상. 퍼포먼스 + 감정 + 연출 완벽 조합.\n\n한 편의 영화 같은 무대가 완성됐습니다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch5_award_stage"
}
```

#### ch5_award_stage
```json
{
  "id": "ch5_award_stage",
  "chapter": 5,
  "bg": "award",
  "spotlight": true,
  "speaker": "내레이터",
  "text": "관객이 숨을 죽였습니다.\n\n마지막 엔딩 포즈 —\n\n정적 후 폭발하는 함성.\n\n모든 시상식 대상 후보 진입.\n\"올해의 그룹\" 여론이 형성됐습니다.\n평론 + 팬덤 + 대중을 완벽 장악했습니다.",
  "activeMemberIndex": -1,
  "isDancing": false,
  "nextSceneId": "ending_award"
}
```

#### ch5_solo_project
```json
{
  "id": "ch5_solo_project",
  "chapter": 5,
  "bg": "photo_studio",
  "titleFlash": "Chapter 5 — 솔로",
  "speaker": "매니저 박 팀장",
  "text": "멤버 솔로 프로젝트가 시작됐습니다.\n\n각자의 색깔이 드러나기 시작했어요.\n그룹과는 다른, 개인만의 이야기.\n\n팬들은 더 깊이 빠져들었습니다.\n\n하지만 팀 활동과 솔로 활동 사이에서, 멤버들의 무게는 달라졌습니다.",
  "activeMemberIndex": 0,
  "nextSceneId": "ch5_solo_tension"
}
```

#### ch5_solo_tension
```json
{
  "id": "ch5_solo_tension",
  "chapter": 5,
  "bg": "dorm_night",
  "speaker": "멤버 (두 번째)",
  "text": "\"나는 왜 솔로 기회가 없는 거야.\"\n\n작은 균열이 생겼습니다.\n\n이 상황을 어떻게 수습하시겠어요?",
  "activeMemberIndex": 1,
  "energyCost": 1,
  "choices": [
    {
      "text": "모든 멤버에게 고르게 솔로 기회를 준다",
      "subText": "팀 결속 유지, 일정 복잡해짐",
      "effect": { "mental": 10, "charm": 6 },
      "nextSceneId": "ending_solo_good"
    },
    {
      "text": "팀 전체 활동으로 다시 집중시킨다",
      "subText": "솔로 프로젝트 축소, 그룹 결속 우선",
      "effect": { "mental": 8, "charm": -3 },
      "nextSceneId": "ending_award"
    }
  ]
}
```

#### ch5_risk_route
```json
{
  "id": "ch5_risk_route",
  "chapter": 5,
  "bg": "backstage",
  "titleFlash": "Chapter 5 — 도전",
  "speaker": "내레이터",
  "text": "무리한 일정이 쌓이기 시작했습니다.\n\n방송, 광고, 해외 스케줄, 앨범 준비.\n모두 동시에 진행됐습니다.\n\n멤버들의 눈빛이 조금씩 흐려지고 있습니다.",
  "activeMemberIndex": -1,
  "nextSceneId": "ch5_risk_decision"
}
```

#### ch5_risk_decision
```json
{
  "id": "ch5_risk_decision",
  "chapter": 5,
  "bg": "practice_night",
  "speaker": "매니저 박 팀장",
  "text": "한 멤버가 건강 이상을 호소했습니다.\n\n스케줄을 강행할지, 잠시 멈출지 결정해야 합니다.\n\n이 선택이 마지막을 결정합니다.",
  "activeMemberIndex": 0,
  "energyCost": 1,
  "choices": [
    {
      "text": "멈추고 멤버를 먼저 챙긴다",
      "subText": "일정 일부 취소, 팀 장기 보호",
      "effect": { "mental": 15, "charm": -5 },
      "nextSceneId": "ending_award"
    },
    {
      "text": "강행한다, 여기서 멈출 수 없다",
      "subText": "극한의 도전, 위기 루트",
      "effect": { "mental": -20, "dance": 8 },
      "nextSceneId": "ending_crisis"
    }
  ]
}
```

---

### 엔딩 씬 4개

#### ending_global
```json
{
  "id": "ending_global",
  "chapter": 6,
  "bg": "overseas",
  "spotlight": true,
  "titleFlash": "Ending — 글로벌 레전드",
  "speaker": "내레이터",
  "text": "이제 이 팀의 이름은 전 세계가 알고 있습니다.\n\n국내를 넘어, 언어를 넘어.\n\nK-POP이라는 장르의 새로운 이정표가 됐습니다.\n\n프로듀서님. 처음부터 지금까지, 모든 선택이 여기로 이어졌습니다.",
  "activeMemberIndex": -1,
  "isDancing": true,
  "isEnding": true,
  "endingData": {
    "type": "global",
    "title": "글로벌 레전드 엔딩",
    "description": "국경을 넘은 K-POP의 이정표. 전 세계 팬들의 마음을 사로잡았습니다. 당신이 만든 그룹이 새로운 역사를 썼어요.",
    "finalStats": true,
    "unlockedRoutes": ["award_route_2nd", "crisis_route_2nd"],
    "shareCardText": "글로벌 레전드 엔딩 달성. 전 세계 무대를 정복한 나의 아이돌."
  }
}
```

#### ending_award
```json
{
  "id": "ending_award",
  "chapter": 6,
  "bg": "award_win",
  "spotlight": true,
  "titleFlash": "Ending — 대상",
  "speaker": "시상식 MC",
  "text": "\"올해의 대상은...\"\n\n...\n\n...\n\n\"축하합니다.\"\n\n멤버들은 눈물을 흘린다.\n당신을 향해 고개를 숙인다.\n\n\"프로듀서님. 감사합니다.\"\n\n음원, 무대, 팬덤, 평가. 모든 것을 장악한 완전체. K-POP 역사에 이름이 남는다.",
  "activeMemberIndex": -1,
  "isEnding": true,
  "endingData": {
    "type": "award",
    "title": "대상 엔딩 — 완벽한 왕좌",
    "description": "국내 최정상, 모든 시상식 대상 수상. 음원부터 무대, 팬덤까지 완벽하게 장악한 레전드 아이돌이 됐습니다.",
    "finalStats": true,
    "unlockedRoutes": ["global_route_2nd", "solo_route_2nd"],
    "shareCardText": "대상 엔딩 달성. 모든 걸 가진 왕좌의 아이돌."
  }
}
```

#### ending_solo_good
```json
{
  "id": "ending_solo_good",
  "chapter": 6,
  "bg": "concert",
  "spotlight": true,
  "titleFlash": "Ending — 슈퍼스타 패밀리",
  "speaker": "내레이터",
  "text": "그룹도, 솔로도.\n\n모두 빛났습니다.\n\n각자의 이름이 대중에게 각인됐지만, 무대 위에서 다시 하나가 됐습니다.\n\n팬들은 말했습니다.\n\"솔로도 좋은데, 같이 있는 게 제일 좋아.\"",
  "activeMemberIndex": -1,
  "isDancing": true,
  "isEnding": true,
  "endingData": {
    "type": "legend",
    "title": "슈퍼스타 패밀리 엔딩",
    "description": "그룹과 솔로를 모두 성공시킨 완벽한 밸런스. 멤버 개개인이 슈퍼스타가 되면서도, 팀으로서의 유대감을 지켜냈습니다.",
    "finalStats": true,
    "unlockedRoutes": ["award_route_2nd"],
    "shareCardText": "슈퍼스타 패밀리 엔딩 달성. 솔로도, 그룹도 모두 정복."
  }
}
```

#### ending_crisis
```json
{
  "id": "ending_crisis",
  "chapter": 6,
  "bg": "crisis_stage",
  "speaker": "내레이터",
  "text": "멤버 한 명이 활동을 중단했습니다.\n\n빈 무대가 허전하게 남았습니다.\n\n하지만 — 팬들은 기다리겠다고 했습니다.\n\"다시 돌아올 때까지 여기 있을게.\" 라고.\n\n이것도 하나의 이야기입니다.\n\n다음엔, 다른 선택을 해볼 수 있어요.",
  "activeMemberIndex": -1,
  "isEnding": true,
  "endingData": {
    "type": "crisis",
    "title": "위기 엔딩 — 멈춤",
    "description": "무리한 활동의 대가. 하지만 이 이야기도 끝이 아닙니다. 팬들은 기다리고 있고, 언제든 다시 시작할 수 있어요. 2회차에서 다른 선택을 해보세요.",
    "finalStats": true,
    "unlockedRoutes": ["global_route_2nd", "award_route_2nd", "crisis_hidden"],
    "shareCardText": "위기 엔딩 달성. 멈춤도 하나의 선택이었다."
  }
}
```

---

## 11. 스탯 & 분기 시스템

### 스탯 정의

| 스탯 | 색상 | 의미 | 영향 |
|-----|-----|-----|-----|
| 보컬 | 파란색 (#60a5fa) | 음색, 라이브 실력 | 음악방송 성적, 팬덤 깊이 |
| 댄스 | 핑크색 (#f472b6) | 안무 숙련도, 무대 장악 | 직캠 조회수, 퍼포먼스 평가 |
| 매력 | 오렌지색 (#fb923c) | 팬서비스, 비주얼 인상 | 팬덤 규모, 바이럴 효과 |
| 멘탈 | 초록색 (#4ade80) | 팀 결속, 정신력 | 위기 이벤트 선택지 잠금/해금 |

### 스탯 제약
- 모든 스탯: 0~100 범위 클램핑
- 게임 시작값: 전부 60
- 멘탈이 20 이하가 되면: "위기 이벤트" 강제 발동 (ch_crisis_forced 씬으로 분기)
- 매력이 90 이상이면: "바이럴 보너스" 플래그 자동 설정

### 단계 목록

| 단계명 | 진입 조건 | 배지 색상 |
|------|---------|---------|
| 연습생 | 시작 | 회색 |
| 데뷔조 | ch1 평가 통과 | 보라색 |
| 신인 아이돌 | ch2 데뷔 성공 | 파란색 |
| 인기 아이돌 | ch3 첫 1위 | 핑크색 |
| 톱스타 | ch4 정상 선택 이후 | 금색 |
| 레전드 | 엔딩 달성 | 무지개색 테두리 |

---

## 12. 카메라 댄스 평가 시스템

### CameraDanceModal 컴포넌트 명세

```typescript
// components/idol-game/CameraDanceModal.tsx
// isCamera: true인 선택지를 클릭했을 때 표시되는 모달

// 구조:
// 1. 헤더: "직접 춤춰보기" 타이틀
// 2. 설명: "카메라 앞에서 직접 춰보세요. 참여만 해도 댄스 스탯 +보너스!"
// 3. 웹캠 미리보기 영역 (navigator.mediaDevices.getUserMedia)
//    - 카메라 권한 거부 시: "카메라 없이 참여하기" 버튼으로 대체
// 4. 5초 카운트다운 버튼 ("시작")
// 5. 카운트다운 중: 숫자 5->4->3->2->1->완료
// 6. 카운트다운 동안 VRM 캐릭터 댄스 애니메이션 재생
// 7. 완료 시: 보너스 스탯 적용 + 씬 전환
// 8. 하단: "건너뛰기" 버튼 (스탯 보너스의 50%만 적용)

// 주의사항:
// - 실제 동작 인식 / 채점 없음
// - "시작" 버튼을 누르면 무조건 보너스 지급 (5초 후)
// - 카메라 권한 없어도 "참여하기" 클릭으로 동일 보너스
// - 영상 녹화 선택: "이 순간 저장하기" 체크박스 (MediaRecorder API)
//   체크 후 완료 시 영상 다운로드 링크 제공
// - 배경음악: 현재 씬 컨셉에 맞는 짧은 루프 음원 재생 (HTML5 Audio)
//   음원 파일: /public/sounds/dance_eval_loop.mp3
```

---

## 13. 세이브 & 복귀 시스템

### 저장 데이터 구조

```typescript
// IdolGameSave 테이블의 JSON 필드들 실제 내용

// membersJson 예시:
[
  { "id": "m1", "name": "민지", "gender": "female", "customImageUrl": null },
  { "id": "m2", "name": "해린", "gender": "female", "customImageUrl": "https://...supabase.../img.png" },
  { "id": "m3", "name": "리즈", "gender": "female", "customImageUrl": null }
]

// statsJson 예시:
{ "vocal": 72, "dance": 85, "charm": 100, "mental": 90 }

// flagsJson 예시:
{
  "emotional_performance": true,
  "concept_bright": true,
  "viral_challenge": true,
  "first_win": true,
  "album_route": true,
  "hit_song": true,
  "ending_award": true
}

// conceptBoardJson 예시:
{
  "logoUrl": "https://...supabase.../logo.png",
  "coverUrl": "https://...supabase.../cover.png"
}
```

### 자동저장 타이밍
1. 선택지 클릭 즉시 (가장 중요)
2. 씬 전환 완료 시
3. 결과 카드 표시 시
4. 브라우저 beforeunload 이벤트
5. 30초 인터벌 백업

### 복귀 흐름
```
/studio/idol-game 접속
  -> GET /api/idol-game/save 호출
  -> 세이브 있음:
       -> "이어하기" / "새 게임 시작" 선택 화면
       -> 이어하기 클릭 -> /studio/idol-game/play
       -> 세이브의 currentSceneId로 goToScene() 호출
       -> 해당 씬 배경 + 스탯 상태로 즉시 복원
  -> 세이브 없음:
       -> /studio/idol-game/setup으로 이동
```

### 멀티 슬롯 (추후 확장)
- 무료: 슬롯 1개
- Pro: 슬롯 3개
- 슬롯 선택 화면: 그룹명 / 현재 단계 / 마지막 플레이 날짜 표시

---

## 14. 팬메이커 스튜디오 연동

### 연동 방식
게임 내 특정 씬에서 팝업 버튼이 나타남 (showVirtualStudioBtn, showConceptStudioBtn 필드).
버튼 클릭 시 해당 스튜디오가 모달 팝업으로 열림.
생성 완료 후 결과 URL이 게임 세이브 데이터에 저장됨.

### VirtualStudioPopup 컴포넌트

```typescript
// components/idol-game/VirtualStudioPopup.tsx
// 버추얼 스튜디오 (/studio/virtual) 를 iframe 또는 별도 탭으로 오픈
// props:
//   memberIndex: number          // 어떤 멤버를 커스터마이징할지
//   memberName: string
//   memberGender: 'female' | 'male'
//   onComplete: (imageUrl: string) => void   // 생성 완료 콜백

// 흐름:
// 1. 모달 팝업 오픈
// 2. 버추얼 스튜디오 UI 표시 (gender 자동 설정)
// 3. AI 이미지 생성 완료
// 4. "이 이미지를 [멤버이름]의 모습으로 사용할까요?" 확인
// 5. 확인 시: imageUrl을 members[memberIndex].customImageUrl에 저장
// 6. 이후 해당 멤버 VRMViewer는 customImageUrl의 img 태그로 표시
// 7. 세이브 자동 저장
```

### ConceptBoard 연동

```typescript
// showConceptStudioBtn: true인 씬에서 버튼 표시
// 컨셉 스튜디오 (/studio/concept) 팝업 오픈
// 생성된 로고 URL -> conceptBoardJson.logoUrl 저장
// 생성된 앨범커버 URL -> conceptBoardJson.coverUrl 저장
// 게임 내 "컨셉 보드 패널" (우측 하단 미니 패널)에 자동 반영
```

### 연동 가능한 스튜디오 목록

| 씬 ID | 연동 스튜디오 | 보상 |
|------|------------|-----|
| ch1_virtual_studio_prompt | 버추얼 스튜디오 | 매력 +3 |
| ch2_concept_studio_prompt | 컨셉 스튜디오 | 매력 +5 |
| ch4_global_sync_prompt | 글로벌 싱크 | 매력 +10 |
| ch5_award_prep | 퍼포먼스 플래너 | 댄스 +5 |

---

## 15. 팬 유니버스 공유 연동

### 공유 트리거
- 엔딩 카드 표시 시 "팬 유니버스에 공유하기" 버튼
- 중간 중간 "이 순간 공유하기" 버튼 (1위 달성, 데뷔 성공 등 ResultCard)

### 공유 카드 자동 생성

```typescript
// 공유 시 POST /api/posts 호출 (기존 팬메이커 API 활용)
// category: 'IDOL_PROJECT'
// title: "{그룹명} — {엔딩 제목}"  // 예: "아일릿 — 대상 엔딩 달성"
// description: endingData.shareCardText
// contentData: {
//   type: 'idol_game_result',
//   groupName: string,
//   stage: string,
//   stats: { vocal, dance, charm, mental },
//   members: Member[],
//   endingType: string,
//   conceptBoardAssets: { logoUrl, coverUrl },
//   choiceCount: number,
//   playtimeMinutes: number
// }
// thumbnailUrl: conceptBoardJson.coverUrl (있으면) or null
// artistId: null (오리지널 창작)
```

### 팬 유니버스 피드 카드 표시
공유된 게임 결과는 기존 PostCard 컴포넌트로 피드에 표시.
카테고리 뱃지: "아이돌 프로젝트"
카드 클릭 시 상세 페이지에서 스탯, 멤버, 엔딩 정보 표시.

---

## 16. UI 컴포넌트 명세

### 전체 화면 레이아웃

```
[StatBar] — position: relative, height: 52px, z-index: 10
[GameArea] — flex: 1, position: relative, overflow: hidden
  [SceneBg] — position: absolute, inset: 0
    [BgImageA] — position: absolute, inset: 0, transition: opacity 0.5s
    [BgImageB] — position: absolute, inset: 0, transition: opacity 0.5s (교체용)
    [SpotlightOverlay] — position: absolute, top: 0, 반투명 원뿔 (CSS)
  [Characters] — position: absolute, bottom: [DialogBox높이+20px], left: 0, right: 0
  [SceneTitleFlash] — position: absolute, top: 50%, left: 50%, transform: translate(-50%,-50%)
  [StatChangePopup] — position: absolute, top: 60px, right: 16px
  [ConceptBoardMini] — position: absolute, bottom: [DialogBox높이+20px], right: 16px (컨셉에셋 있을 때만)
  [VirtualStudioBtn] — position: absolute, top: 60px, left: 16px (showVirtualStudioBtn일 때만)
  [SaveToast] — position: absolute, bottom: [DialogBox높이+10px], left: 50%, transform: translateX(-50%)
  [EnergyBar] — position: absolute, top: 60px, right: 16px (StatChangePopup 없을 때)
  [TransitionOverlay] — position: absolute, inset: 0, background: black, z-index: 20
[DialogBox] — position: relative, min-height: 180px, z-index: 10
```

### 이모티콘 대체 규칙

모든 이모티콘을 lucide-react 아이콘 또는 텍스트로 대체:

| 제거 대상 | 대체 방법 |
|---------|---------|
| 스탯 상승 표시 | 텍스트 "▲" + 스탯명 |
| 스탯 하강 표시 | 텍스트 "▼" + 스탯명 |
| 저장 완료 | lucide `<Check />` 아이콘 |
| 단계 배지 텍스트 | 텍스트만 (연습생, 데뷔조, ...) |
| 선택지 앞 아이콘 | 없음 (텍스트만) |
| 보너스 배지 | 텍스트 "+보너스" |
| 결과 카드 | lucide `<Trophy />`, `<Star />` 등 |
| 씬 타이틀 | 텍스트만 |

---

## 17. API 명세

### GET /api/idol-game/save

인증 필수. 현재 유저의 세이브 데이터 반환.

**Response:**
```json
{
  "success": true,
  "data": {
    "hasSave": true,
    "save": {
      "groupName": "아일릿",
      "groupType": "girl",
      "concept": "청량 & 성장형",
      "membersJson": [...],
      "statsJson": { "vocal": 72, "dance": 85, "charm": 100, "mental": 90 },
      "stage": "인기 아이돌",
      "week": 10,
      "energy": 3,
      "currentSceneId": "ch4_rising_status",
      "flagsJson": {...},
      "choiceHistory": [...],
      "conceptBoardJson": {...},
      "updatedAt": "2026-03-26T..."
    }
  }
}
```

**세이브 없음:**
```json
{ "success": true, "data": { "hasSave": false } }
```

---

### POST /api/idol-game/save

인증 필수. 세이브 데이터 저장 (upsert).

**Request Body:**
```json
{
  "groupName": "아일릿",
  "groupType": "girl",
  "concept": "청량 & 성장형",
  "membersJson": [...],
  "statsJson": { "vocal": 72, "dance": 85, "charm": 100, "mental": 90 },
  "stage": "인기 아이돌",
  "week": 10,
  "energy": 3,
  "currentSceneId": "ch4_rising_status",
  "flagsJson": {...},
  "choiceHistory": [...],
  "conceptBoardJson": {...}
}
```

**Response:**
```json
{ "success": true, "data": { "savedAt": "2026-03-26T..." } }
```

---

### GET /api/idol-game/energy

인증 필수. 현재 에너지 잔량 반환. 자정 초기화 처리.

**Response:**
```json
{
  "success": true,
  "data": {
    "current": 3,
    "max": 5,
    "resetAt": "2026-03-27T15:00:00Z"
  }
}
```

서버 로직:
```
energyResetAt이 현재 시각 이전이면:
  energy = isPro ? 10 : 5
  energyResetAt = 다음 자정 (KST)
  DB 업데이트
```

---

### POST /api/idol-game/energy

인증 필수. 에너지 소비.

**Request Body:** `{ "amount": 1 }`

**Response:**
```json
{ "success": true, "data": { "remaining": 2 } }
```

**에너지 부족 시 (409):**
```json
{
  "success": false,
  "error": {
    "code": "ENERGY_EMPTY",
    "message": "오늘 에너지를 모두 사용했어요. 내일 다시 돌아오면 에너지가 충전돼요.",
    "resetAt": "2026-03-27T15:00:00Z"
  }
}
```

---

## 18. QA 체크리스트

### 게임 설정
- [ ] 그룹명 입력 + 그룹유형 + 인원 + 컨셉 모두 선택해야 "다음" 활성화
- [ ] 걸그룹 선택 시 멤버 성별 전체 여성 고정 (토글 비활성화)
- [ ] 보이그룹 선택 시 멤버 성별 전체 남성 고정
- [ ] 혼성 선택 시 멤버별 성별 개별 선택 가능
- [ ] 성별 선택에 따라 VRM 모델 즉시 교체 확인
- [ ] 멤버 이름 빈칸 시 "멤버 N" 기본값 자동 적용
- [ ] 설정 확인 화면에서 그룹명/인원/컨셉/멤버 목록 정확히 표시

### VRM 렌더링
- [ ] female_casual.vrm 로딩 성공 확인
- [ ] male_casual.vrm 로딩 성공 확인
- [ ] 로딩 중 스켈레톤 플레이스홀더 표시
- [ ] 로딩 실패 시 CSS 실루엣 fallback 표시
- [ ] 활성 멤버 scale + 밝기 변화 애니메이션
- [ ] 무대 씬 댄스 애니메이션
- [ ] customImageUrl 있을 때 img 태그로 대체 표시

### 씬 엔진
- [ ] 씬 전환 노이즈 아웃 (검정 fade-in/out) 동작
- [ ] 배경 이미지 교체 정상 동작 (20개 배경 전체)
- [ ] 씬 타이틀 플래시 1.5초 후 사라짐
- [ ] 무대 씬 스포트라이트 CSS 표시
- [ ] 타이핑 효과 22ms/글자 동작
- [ ] 타이핑 중 클릭 시 전체 즉시 표시
- [ ] 선택지 버튼 hover 애니메이션
- [ ] isCamera: true 선택지 핑크 강조 테두리
- [ ] 보너스 배지 표시

### 스탯 시스템
- [ ] 선택지 클릭 후 스탯 변화 수치 팝업 표시 (▲/▼)
- [ ] 상단 스탯 바 숫자 카운트 애니메이션
- [ ] 스탯 0~100 범위 클램핑
- [ ] 멘탈 20 이하 시 위기 이벤트 발동
- [ ] 단계 상승 시 배지 색상 변경

### 세이브 시스템
- [ ] 선택지 클릭 즉시 DB 저장 확인
- [ ] "저장됨" 토스트 1.5초 표시
- [ ] 게임 나갔다가 재접속 시 마지막 씬 정확히 복원
- [ ] 스탯 / 플래그 / 멤버 데이터 모두 복원
- [ ] beforeunload 이벤트 저장 동작

### 에너지 시스템
- [ ] 에너지 5포인트 시작 확인
- [ ] 선택지 클릭 시 1포인트 소비
- [ ] 에너지 0 시 사용 불가 모달 표시
- [ ] 자정 KST 기준 에너지 초기화
- [ ] Pro 유저 10포인트 확인

### 카메라 댄스
- [ ] isCamera 선택지 클릭 시 모달 표시
- [ ] "시작" 클릭 후 5초 카운트다운
- [ ] 카운트다운 중 VRM 댄스 애니메이션
- [ ] 5초 후 보너스 스탯 자동 적용 + 씬 전환
- [ ] "건너뛰기" 클릭 시 50% 보너스만 적용
- [ ] 카메라 권한 없어도 "참여하기" 로 보너스 적용

### 스튜디오 연동
- [ ] ch1 버추얼 스튜디오 버튼 표시
- [ ] 버추얼 스튜디오 팝업 오픈
- [ ] 생성 이미지 URL 멤버 슬롯에 저장
- [ ] 저장 후 해당 멤버 VRM 대신 이미지 표시
- [ ] 컨셉 스튜디오 연동 + conceptBoardJson 저장
- [ ] 글로벌 싱크 연동 버튼 표시 (ch4)

### 팬 유니버스 공유
- [ ] 엔딩 카드 "공유하기" 버튼
- [ ] POST /api/posts 호출 정상 (category: IDOL_PROJECT)
- [ ] 공유 카드 팬 유니버스 피드에 표시
- [ ] 공유 카드 클릭 시 상세 정보 표시

### 이모티콘 없음
- [ ] UI 전체에서 emoji 문자 없음 확인
- [ ] 씬 스크립트 text 필드에 emoji 없음
- [ ] 선택지 텍스트에 emoji 없음
- [ ] 결과 카드에 emoji 없음 (lucide 아이콘으로 대체)

### 모바일
- [ ] 375px 기준 게임 화면 깨짐 없음
- [ ] 대화창 + 선택지 모바일에서 정상 표시
- [ ] 스탯 바 모바일에서 overflow 없음
