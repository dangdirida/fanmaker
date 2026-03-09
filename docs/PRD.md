# 팬메이커 (FanMaker) — 최종 PRD v3.0
**버전:** 3.0 (최종)
**작성일:** 2026년 3월
**문서 상태:** Claude Code 개발 명령용 최종본
**기술 스택:** Next.js 14 (App Router) + TypeScript

---

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [개발 단계별 순서 Sprint](#2-개발-단계별-순서)
3. [기술 스택 & 프로젝트 구조](#3-기술-스택--프로젝트-구조)
4. [데이터베이스 스키마](#4-데이터베이스-스키마)
5. [인증 시스템](#5-인증-시스템)
6. [이메일 발송 시스템](#6-이메일-발송-시스템)
7. [결제 시스템](#7-결제-시스템)
8. [서버 & 인프라 세팅](#8-서버--인프라-세팅)
9. [어드민 모드](#9-어드민-모드)
10. [보안](#10-보안)
11. [홈 & 네비게이션](#11-홈--네비게이션)
12. [팬 유니버스 전체 피드](#12-팬-유니버스-전체-피드)
13. [아티스트 유니버스](#13-아티스트-유니버스)
14. [AI 창작 스튜디오](#14-ai-창작-스튜디오)
15. [AI 퍼포먼스 플래너](#15-ai-퍼포먼스-플래너)
16. [AI 아이돌 프로젝트](#16-ai-아이돌-프로젝트)
17. [글로벌 싱크](#17-글로벌-싱크)
18. [프로필 & 아카이브](#18-프로필--아카이브)
19. [API 전체 명세](#19-api-전체-명세)
20. [에러 처리 & QA 체크리스트](#20-에러-처리--qa-체크리스트)
21. [환경변수 목록](#21-환경변수-목록)
22. [배포 & 보안 설정](#22-배포--보안-설정)

---

## 1. 프로젝트 개요

### 서비스 정의
팬이 AI 도구로 K-pop 아이돌 프로젝트를 직접 프로듀싱하고, 아티스트별 유니버스에서 커뮤니티와 공유하는 팬 참여형 창작 플랫폼

### Phase 1 MVP 기능 범위
| 기능 | 포함 | 비고 |
|------|------|------|
| 구글 로그인 | ✅ | 프로필 사진 자동 연동 |
| 애플 로그인 | ✅ | |
| 이메일 발송 시스템 | ✅ | 가입 환영 / 알림 이메일 |
| 결제 시스템 | ✅ | Stripe (Pro 구독) |
| 홈 자동슬라이드 배너 | ✅ | 기능 소개 + 바로가기 |
| 팬 유니버스 전체 피드 | ✅ | 전 아티스트 통합 인기 작품 스크롤 |
| 아티스트 유니버스 | ✅ | Weverse 구조 참고 |
| 아티스트 선택 우선 UI | ✅ | 스튜디오 진입 시 아티스트 먼저 선택 |
| 리믹스 스튜디오 | ✅ | |
| 버추얼 스튜디오 | ✅ | |
| 컨셉 스튜디오 | ✅ | |
| 퍼포먼스 플래너 | ✅ | |
| AI 아이돌 프로젝트 | ✅ | |
| 글로벌 싱크 | ✅ | 자막/번역 (더빙은 Phase 2) |
| 프로필 & 아카이브 | ✅ | |
| 어드민 대시보드 | ✅ | |
| 보안 (Rate limit, CSRF) | ✅ | |
| 기획사 제출 시스템 | ❌ | Phase 2 |
| 립싱크 더빙 | ❌ | Phase 2 |

### 내부 데모 정책
- Vercel Password Protection으로 링크 접근 보호
- 실제 K-pop 음원/이미지 사용 가능 (비공개 내부 데모 목적)
- 대표 + 개발팀만 접근

---

## 2. 개발 단계별 순서

> Claude Code에 아래 Sprint 순서대로 지시할 것.
> 각 Sprint 완료 기준을 모두 충족한 뒤 다음 Sprint 진행.

---

### Sprint 0 — 프로젝트 초기화 및 인프라 세팅
**목표:** 서버 기동, DB 연결, 환경 변수 구성

**Claude Code 명령:**
```
Next.js 14 App Router + TypeScript 프로젝트를 아래 조건으로 세팅해줘.

1. 패키지 설치:
   tailwindcss, @tailwindcss/typography,
   shadcn/ui (npx shadcn-ui@latest init),
   prisma, @prisma/client,
   next-auth@beta, @auth/prisma-adapter,
   zustand, @tanstack/react-query,
   react-hook-form, zod,
   @supabase/supabase-js, @supabase/storage-js,
   stripe, @stripe/stripe-js,
   resend,
   wavesurfer.js,
   konva, react-konva,
   video.js,
   lucide-react,
   date-fns,
   clsx, tailwind-merge,
   @upstash/redis, @upstash/ratelimit

2. prisma/schema.prisma에 [4. 데이터베이스 스키마] 전체 내용 작성

3. .env.local 파일 생성 (값은 placeholder로, [21. 환경변수 목록] 기준)

4. lib/prisma.ts — Prisma 싱글톤 클라이언트
   lib/supabase.ts — Supabase 클라이언트 (server/client 분리)
   lib/redis.ts — Upstash Redis 클라이언트
   lib/utils.ts — cn() 유틸 함수

5. npx prisma generate 실행
   npx prisma migrate dev --name init 실행
```

**완료 기준:**
- [ ] `npm run dev` 실행 시 localhost:3000 정상 접속
- [ ] `npx prisma studio` 실행 시 테이블 목록 확인
- [ ] .env.local 파일에 모든 키 placeholder 존재

---

### Sprint 1 — 인증 시스템
**목표:** 구글/애플 로그인, 프로필 사진 연동, 온보딩 플로우, 미들웨어 보호

**Claude Code 명령:**
```
인증 시스템을 아래 조건으로 구현해줘.

1. lib/auth.ts
   - NextAuth v5 (Auth.js) 설정
   - Google OAuth Provider: 로그인 시 name, email, image(프로필 사진) User 테이블에 저장
   - Apple OAuth Provider 추가
   - PrismaAdapter 연결
   - 세션에 user.id, user.nickname, user.activityType, user.onboardingDone 포함
   - 최초 로그인(onboardingDone=false) 시 /onboarding 리다이렉트

2. app/(auth)/login/page.tsx
   - 구글 로그인 버튼 (구글 로고 포함)
   - 애플 로그인 버튼 (애플 로고 포함)
   - 팬메이커 로고 + "K-pop 팬 창작 플랫폼" 카피

3. app/(auth)/onboarding/page.tsx — 3단계 스텝퍼
   - Step 1: 닉네임 입력 (중복 검사: GET /api/users/check-nickname?nickname=xxx)
   - Step 2: 관심 아티스트 선택 (Artist 테이블에서 그리드로 표시, 최대 5개 선택)
   - Step 3: 활동 유형 선택 (라이트팬 / 창작팬 / 글로벌팬 / 예비크리에이터)
   - 완료 시 User.onboardingDone = true 업데이트 후 /feed 이동
   - 완료 시 가입 환영 이메일 발송 (lib/email.ts 호출)

4. middleware.ts
   - 보호 경로: /studio/*, /profile/*, /admin/*, /api/ai/*, POST /api/posts
   - 미인증 시 /login?callbackUrl=원래경로 리다이렉트

5. types/next-auth.d.ts — 세션 타입 확장
```

**완료 기준:**
- [ ] 구글 로그인 후 헤더에 구글 프로필 사진 표시
- [ ] 애플 로그인 동작
- [ ] 최초 로그인 → 온보딩 3단계 → 환영 이메일 수신 → /feed 이동
- [ ] 재방문 시 /feed 바로 진입
- [ ] 비로그인으로 /studio 접근 시 /login 리다이렉트

---

### Sprint 2 — 이메일 발송 시스템
**목표:** Resend 기반 트랜잭션 이메일 (환영, 알림)

**Claude Code 명령:**
```
lib/email.ts를 Resend SDK로 구현해줘.

발송 함수 목록:
1. sendWelcomeEmail(to: string, nickname: string)
   - 제목: "팬메이커에 오신 걸 환영해요, {nickname}님! 🎤"
   - 내용: 팬메이커 소개 + [창작 시작하기] 버튼 (fanmaker.vercel.app/studio 링크)
   - HTML 템플릿: 다크 배경(#0a0a0a), 핑크 포인트(#ff3d7f), 깔끔한 레이아웃

2. sendReactionNotificationEmail(to: string, nickname: string, postTitle: string, reactionCount: number)
   - 제목: "내 창작물에 {reactionCount}개의 반응이 달렸어요 ✨"
   - 내용: 창작물 제목 + [확인하기] 버튼

3. sendCommentNotificationEmail(to: string, nickname: string, postTitle: string, commenterNickname: string)
   - 제목: "{commenterNickname}님이 내 창작물에 댓글을 남겼어요 💬"

발송자 이메일: noreply@fanmaker.app
모든 함수는 발송 실패 시 콘솔 에러 로깅만 하고 throw하지 않음 (이메일 실패가 서비스 중단되면 안 됨)
```

**완료 기준:**
- [ ] 온보딩 완료 시 환영 이메일 수신 확인
- [ ] 이메일 HTML 렌더링 정상 (버튼, 색상)
- [ ] 발송 실패 시 서비스 중단 없이 에러 로그만 출력

---

### Sprint 3 — DB 시드 & 공통 레이아웃
**목표:** 아티스트 초기 데이터, 사이드바/헤더/모바일 탭바

**Claude Code 명령:**
```
1. prisma/seed.ts 작성
아티스트 초기 데이터 20개 삽입:
[
  { name: "BTS", nameEn: "BTS", agency: "HYBE" },
  { name: "BLACKPINK", nameEn: "BLACKPINK", agency: "YG" },
  { name: "aespa", nameEn: "aespa", agency: "SM" },
  { name: "SEVENTEEN", nameEn: "SEVENTEEN", agency: "HYBE" },
  { name: "NewJeans", nameEn: "NewJeans", agency: "ADOR" },
  { name: "IVE", nameEn: "IVE", agency: "Starship" },
  { name: "Stray Kids", nameEn: "Stray Kids", agency: "JYP" },
  { name: "TWICE", nameEn: "TWICE", agency: "JYP" },
  { name: "EXO", nameEn: "EXO", agency: "SM" },
  { name: "NCT WISH", nameEn: "NCT WISH", agency: "SM" },
  { name: "LE SSERAFIM", nameEn: "LE SSERAFIM", agency: "HYBE" },
  { name: "(G)I-DLE", nameEn: "(G)I-DLE", agency: "Cube" },
  { name: "TXT", nameEn: "TOMORROW X TOGETHER", agency: "HYBE" },
  { name: "ENHYPEN", nameEn: "ENHYPEN", agency: "HYBE" },
  { name: "MONSTA X", nameEn: "MONSTA X", agency: "Starship" },
  { name: "SHINee", nameEn: "SHINee", agency: "SM" },
  { name: "Red Velvet", nameEn: "Red Velvet", agency: "SM" },
  { name: "GOT7", nameEn: "GOT7", agency: "ABYSS" },
  { name: "MAMAMOO", nameEn: "MAMAMOO", agency: "RBW" },
  { name: "LNGSHOT", nameEn: "LNGSHOT", agency: "MORE VISION" }
]
각 아티스트의 groupImageUrl은 null로 설정 (나중에 어드민에서 업로드)
package.json에 "seed": "ts-node prisma/seed.ts" 스크립트 추가

2. app/(main)/layout.tsx — 공통 레이아웃
- 좌측 사이드바 (데스크톱 768px 이상):
  * 상단: 팬메이커 로고 (텍스트 로고, 클릭 시 /feed)
  * 메뉴 항목: 팬 유니버스(/feed), 창작 스튜디오(/studio), 내 프로필(/profile)
  * 스튜디오 하위메뉴 (아코디언): 리믹스/버추얼/컨셉/퍼포먼스/아이돌프로젝트/글로벌싱크
  * 하단: Pro 업그레이드 배너 (미구독자만), 유저 아바타+닉네임+로그아웃
- 상단 헤더:
  * 현재 페이지 타이틀
  * 우측: 알림 벨 아이콘, 유저 아바타 (클릭 시 드롭다운: 프로필/설정/로그아웃)
- 하단 탭바 (모바일):
  * 홈(피드) / 스튜디오 / 프로필 3개 탭

3. components/common/ArtistSelector.tsx
- 스튜디오 기능 진입 시 최우선으로 표시되는 아티스트 선택 모달/패널
- 전체 아티스트 그리드 (이미지 + 이름)
- 검색 인풋
- "선택 안 함 (오리지널 창작)" 옵션 포함
- 선택 후 해당 아티스트 context로 스튜디오 진입
```

**완료 기준:**
- [ ] `npx prisma db seed` 후 DB에 아티스트 20개 확인 (NCT WISH 포함)
- [ ] 사이드바 정상 렌더링
- [ ] 모바일에서 하단 탭바 표시
- [ ] ArtistSelector 모달 팝업 동작

---

### Sprint 4 — 홈 (자동슬라이드 배너)
**목표:** 로그인 전/후 홈 화면, 자동슬라이드 기능 소개 배너

**Claude Code 명령:**
```
app/(main)/feed/page.tsx 상단에 자동슬라이드 배너를 구현해줘.

배너 슬라이드 6개 (각 슬라이드 구성: 배경 그라데이션 + 아이콘 + 제목 + 설명 + 바로가기 버튼):
1. 제목: "내가 직접 만드는 K-pop 리믹스" / 설명: "좋아하는 아이돌 음원을 AI로 재탄생시켜 보세요" / 버튼: "리믹스 시작" → /studio/remix / 배경: 딥퍼플→블랙
2. 제목: "나만의 버추얼 아이돌 디자인" / 설명: "AI로 버추얼 아이돌의 비주얼을 직접 만들어보세요" / 버튼: "캐릭터 만들기" → /studio/virtual / 배경: 핑크→퍼플
3. 제목: "다음 앨범 컨셉, 팬이 먼저 만든다" / 설명: "로고부터 앨범커버까지 컨셉 키트를 제작해보세요" / 버튼: "컨셉 제작" → /studio/concept / 배경: 블루→시안
4. 제목: "무대 위 퍼포먼스를 직접 기획" / 설명: "포메이션과 동선을 기획하고 AI 시뮬레이션으로 확인해보세요" / 버튼: "퍼포먼스 기획" → /studio/performance / 배경: 레드→오렌지
5. 제목: "새로운 아이돌 그룹을 창조해보세요" / 설명: "세계관부터 멤버 구성까지, AI와 함께 데뷔 기획서를 완성해요" / 버튼: "아이돌 기획" → /studio/idol-project / 배경: 그린→블루
6. 제목: "K-pop을 전 세계 언어로" / 설명: "내가 좋아하는 아티스트의 콘텐츠를 다국어로 번역·공유해요" / 버튼: "번역 시작" → /studio/global-sync / 배경: 골드→오렌지

자동 슬라이드 설정:
- 3초마다 자동 전환 (마우스 호버 시 일시 정지)
- 하단 인디케이터 도트 (클릭으로 이동)
- 좌/우 화살표 버튼
- 전환 애니메이션: 페이드 or 슬라이드 (CSS transition)

배너 높이: 데스크톱 420px / 모바일 240px
```

**완료 기준:**
- [ ] 6개 슬라이드 자동 전환 (3초)
- [ ] 호버 시 일시정지
- [ ] 도트 인디케이터 클릭 이동
- [ ] 바로가기 버튼 클릭 시 해당 스튜디오 이동
- [ ] 모바일 반응형 정상

---

### Sprint 5 — 팬 유니버스 전체 피드
**목표:** 전체 아티스트 통합 피드, 필터, 반응, 댓글

**Claude Code 명령:**
```
팬 유니버스 전체 피드를 구현해줘.

1. 피드 레이아웃 (배너 아래):
   - 탭: [전체] [팔로잉] [트렌딩]
   - 카테고리 필터 칩: [전체] [리믹스] [버추얼] [컨셉] [퍼포먼스] [아이돌프로젝트] [글로벌싱크]
   - 아티스트 필터: 가로 스크롤 칩 (전체 + 20개 아티스트)
   - 정렬: 최신순 / 인기순

2. PostCard 컴포넌트 (components/feed/PostCard.tsx):
   - 썸네일 이미지 (없으면 카테고리별 기본 이미지)
   - 카테고리 뱃지 (색상 구분)
   - 제목
   - 작성자: 프로필 사진 + 닉네임 + 시간 (몇 분 전 형식)
   - 반응 버튼 3개: ❤️ 좋아요 / 📣 응원 / 😮 놀라움 (각 카운트 표시)
   - 반응 클릭: POST /api/posts/:id/reactions (토글 방식)
   - 댓글 아이콘 + 카운트, 조회수
   - 카드 클릭 시 /post/:id 상세 페이지

3. 무한 스크롤:
   - Intersection Observer로 구현
   - 20개씩 로드
   - GET /api/posts?tab=all&category=&artistId=&page=1&limit=20

4. PostDetail 페이지 (app/(main)/post/[postId]/page.tsx):
   - 창작물 전체 내용 (카테고리별 렌더링)
   - 반응 바
   - 댓글 섹션 (CommentSection.tsx)
     * 댓글 목록 (최신순)
     * 대댓글 1단계
     * 댓글 작성 인풋 (로그인 시)
     * 내 댓글 삭제 버튼

5. API Route Handlers:
   GET  /api/posts — 목록 (쿼리 파라미터: tab, category, artistId, page, limit)
   POST /api/posts — 창작물 게시 (인증 필요)
   GET  /api/posts/[postId] — 상세 (조회수 +1)
   POST /api/posts/[postId]/reactions — 반응 토글
   GET  /api/posts/[postId]/comments — 댓글 목록
   POST /api/posts/[postId]/comments — 댓글 작성
   DELETE /api/posts/[postId]/comments/[commentId] — 댓글 삭제 (본인만)
```

**완료 기준:**
- [ ] 피드 카드 무한 스크롤 동작
- [ ] 탭/카테고리/아티스트 필터 동작
- [ ] 반응 버튼 토글 (즉시 UI 업데이트)
- [ ] 댓글 작성/삭제 동작
- [ ] 상세 페이지 접근 시 조회수 증가

---

### Sprint 6 — 아티스트 유니버스
**목표:** 개별 아티스트 페이지 (Weverse 구조)

**Claude Code 명령:**
```
아티스트 유니버스 페이지를 Weverse 구조로 구현해줘.

URL: /artist/[artistId]

1. 히어로 섹션 (페이지 최상단):
   - 아티스트 대형 커버 이미지 (전체 너비, 높이 400px)
   - 이미지 위에 아티스트 이름 (흰색 대형 텍스트)
   - [이 아티스트 팔로우] 버튼 (토글, POST /api/artists/:id/follow)

2. 탭 네비게이션 (히어로 아래 고정):
   - Highlight / Fan / Notice 탭
   - Highlight: 아티스트 관련 인기 창작물 상위 노출 + Fan Posts
   - Fan: 해당 아티스트 태그된 창작물 전체 (필터/정렬 포함)
   - Notice: 어드민이 작성한 공지 (관리자 전용 작성)

3. 2단 레이아웃 (태블릿/데스크톱):
   - 좌: 메인 피드 (창작물 목록) — 너비 65%
   - 우: 아티스트 정보 패널 — 너비 35%
     * 아티스트 로고/썸네일
     * SNS 링크 (유튜브/인스타/X/틱톡 아이콘)
     * 소속사, 멤버 수, 데뷔일 정보
     * 멤버 목록 (이름 + 아코디언)
     * 팔로워 수

4. 모바일: 1단 레이아웃, 아티스트 정보는 탭 내 접이식

5. 전체 피드에서 아티스트 클릭:
   - 사이드바 아티스트 칩 or 피드 카드의 아티스트 뱃지 클릭 → /artist/[artistId]

6. API:
   GET /api/artists — 전체 아티스트 목록
   GET /api/artists/[artistId] — 아티스트 상세
   POST /api/artists/[artistId]/follow — 팔로우 토글
   GET /api/artists/[artistId]/posts — 해당 아티스트 창작물 목록
```

**완료 기준:**
- [ ] 아티스트 히어로 이미지/이름 표시
- [ ] 탭 전환 (Highlight / Fan / Notice)
- [ ] 2단 레이아웃 (데스크톱) / 1단 (모바일)
- [ ] 팔로우 토글 동작
- [ ] 해당 아티스트 창작물만 필터링

---

### Sprint 7 — 파일 업로드 시스템
**목표:** Supabase Storage 업로드 (이미지, 오디오, 영상)

**Claude Code 명령:**
```
파일 업로드 시스템을 구현해줘.

1. app/api/upload/route.ts
   - POST 요청: multipart/form-data
   - 파라미터: file (File), bucket ('audio' | 'images' | 'videos')
   - 파일 유효성 검사:
     * 오디오: MP3/WAV/AAC, 최대 50MB
     * 이미지: JPG/PNG/WEBP, 최대 10MB
     * 영상: MP4/MOV, 최대 500MB
   - Supabase Storage에 저장: {bucket}/{userId}/{timestamp}_{filename}
   - 공개 URL 반환
   - 에러: FILE_TOO_LARGE, UNSUPPORTED_FORMAT, UPLOAD_FAILED

2. components/common/FileUploader.tsx
   - 드래그앤드롭 + 클릭 파일 선택
   - 진행률 프로그레스 바
   - 업로드 완료 시 미리보기 (이미지: 썸네일, 오디오: 파일명)
   - Props: { accept, maxMB, bucket, onUpload: (url: string) => void }

3. Supabase Storage 버킷 정책:
   - 'audio' 버킷: 인증된 유저만 업로드, 공개 읽기
   - 'images' 버킷: 인증된 유저만 업로드, 공개 읽기
   - 'videos' 버킷: 인증된 유저만 업로드, 공개 읽기
```

**완료 기준:**
- [ ] 이미지 업로드 후 Supabase에서 URL 확인
- [ ] 오디오 업로드 후 URL 확인
- [ ] 50MB 초과 시 에러 메시지 표시
- [ ] 지원 안 되는 형식 업로드 시 에러 표시

---

### Sprint 8 — AI 창작 스튜디오 (컨셉 / 버추얼)
**목표:** 이미지 생성 AI 기능 2개 먼저 구현 (텍스트→이미지가 가장 단순)

**Claude Code 명령:**
```
AI 창작 스튜디오 중 컨셉 스튜디오와 버추얼 스튜디오를 구현해줘.

공통 패턴:
- 모든 스튜디오 페이지 진입 시 ArtistSelector 모달 최우선 표시
  ("어떤 아티스트로 창작할까요?" / "오리지널로 창작" 선택 포함)
- AI 생성 요청 → AIJob 레코드 생성 → jobId 반환 → 3초 간격 polling
- 생성 중: AILoadingState 컴포넌트 (예상 시간 카운트다운 포함)
- 완료 시: 결과 표시 + [피드에 게시] 버튼 → PublishModal

[컨셉 스튜디오 — /studio/concept]
레이아웃:
 상단: ArtistSelector (필수)
 Step 1 폼:
   - 아티스트/그룹명 입력 (ArtistSelector에서 선택 시 자동 채워짐)
   - 컨셉 무드 선택 칩: [다크판타지] [청량] [로맨틱] [파워풀] [사이버펑크] [자연/힐링] [직접입력]
   - 핵심 키워드 태그 입력 (최대 5개)
   - 대표 색상 컬러 피커
   - [컨셉 키트 생성] 버튼
 Step 2 결과:
   - 로고 시안 5개 (클릭으로 선택)
   - 앨범커버 1개
   - 키비주얼 1개
   - 색상 팔레트 5색
   - 무드보드 자동 배치 (CSS Grid)
   - [전체 ZIP 다운로드] [아이돌 프로젝트로 연결] [피드 게시]

API: POST /api/ai/concept/generate
Request: { artistName, mood, keywords, primaryColor }
처리: Replicate FLUX 1.1 Pro 모델로 이미지 생성 (병렬)
     프롬프트 형식: "K-pop album concept, {mood}, {keywords}, logo design, professional"

[버추얼 스튜디오 — /studio/virtual]
레이아웃:
 좌: 편집 패널
   - 성별 선택: 여성/남성/중성
   - 피부톤 선택: 6가지 컬러 스와치
   - 스타일 프리셋 선택: [아이돌] [청순] [파워풀] [다크] [판타지] [레트로]
   - 추가 묘사 텍스트에어리어 (한국어/영어 모두 입력 가능)
   - [이미지 생성] 버튼
 우: 실시간 프리뷰
   - 생성 전: 점선 플레이스홀더 + 안내 텍스트
   - 생성 후: 이미지 표시 + [재생성] [저장] [게시] 버튼

API: POST /api/ai/virtual/generate
Request: { gender, skinTone, stylePreset, customPrompt }
프롬프트 조합:
 base: "Korean K-pop idol, high quality portrait, detailed, {gender}, {skinTone} skin tone"
 style: STYLE_PRESETS[stylePreset]
 full: "{base}, {style}, {customPrompt}, professional photoshoot"

공통 AIJob polling:
GET /api/ai/jobs/[jobId] → { status, output?, error? }
```

**완료 기준:**
- [ ] 스튜디오 진입 시 ArtistSelector 모달 먼저 표시
- [ ] 컨셉 생성 → 로고 5개 + 앨범커버 + 키비주얼 결과 표시
- [ ] 버추얼 생성 → 캐릭터 이미지 결과 표시
- [ ] AI 생성 중 로딩 UI 표시
- [ ] [피드 게시] → PublishModal → 피드에 반영

---

### Sprint 9 — AI 창작 스튜디오 (리믹스)
**목표:** 오디오 업로드, BPM/키 조정, 음원 분리, AI 리믹스

**Claude Code 명령:**
```
리믹스 스튜디오를 구현해줘. (/studio/remix)

진입 시 ArtistSelector 모달 최우선 표시.

레이아웃:
 Step 1: 음원 업로드
   - FileUploader (오디오 전용, MP3/WAV/AAC, 50MB)
   - 업로드 완료 시 Wavesurfer.js 파형 표시
   - 파형 색상: 핑크(#ff3d7f) 그라데이션

 Step 2: 편집 패널 (업로드 완료 후 활성화)
   좌 패널:
   - BPM 슬라이더 (60~200, 원본 BPM 자동 감지 후 기본값)
   - 원본으로 리셋 버튼
   - 키 조정 (+/-6 반음, +/- 버튼)
   - [파트 분리] 버튼 → POST /api/ai/remix/separate

   우 패널:
   - Wavesurfer.js 파형 (BPM 변경 시 재생 속도 실시간 반영, preservePitch: true)
   - 재생/정지/되감기 버튼

 Step 3: AI 리믹스 제안 (파트 분리 완료 후 활성화)
   - 스타일 카드 3개: [댄스팝] [어쿠스틱] [신스웨이브]
   - 카드 클릭 → POST /api/ai/remix/generate → polling
   - 완료 시 오디오 플레이어로 미리듣기
   - [MP3 다운로드] [피드 게시]

API:
POST /api/ai/remix/separate
  Request: { audioUrl }
  처리: Replicate Demucs 모델 (음원 분리: vocal, accompaniment, bass)
  Response: { jobId }

POST /api/ai/remix/generate
  Request: { audioUrl, style, bpm, key }
  처리: Replicate MusicGen 모델
  Response: { jobId }
```

**완료 기준:**
- [ ] 오디오 업로드 후 파형 표시
- [ ] BPM 슬라이더 변경 시 재생 속도 변화
- [ ] 파트 분리 API 호출 → 결과 확인
- [ ] AI 리믹스 스타일 선택 → 생성 → 미리듣기
- [ ] 피드 게시 동작

---

### Sprint 10 — AI 퍼포먼스 플래너
**목표:** Konva.js 포메이션 에디터, 씬 타임라인, 시뮬레이션 영상

**Claude Code 명령:**
```
퍼포먼스 플래너를 구현해줘. (/studio/performance)

진입 시 ArtistSelector 모달 최우선 표시.

레이아웃:
 좌: 씬 타임라인 패널
   - 씬 카드 목록 (씬명, 시간 범위)
   - [+ 씬 추가] 버튼
   - 씬 클릭 시 해당 씬 포메이션 에디터에 표시

 중앙: 포메이션 에디터 (Konva.js 캔버스, 600x400px)
   - 탑뷰 무대 (점선 사각형 경계)
   - 멤버 노드: 지름 40px 원형, 색상 구분, 이름 표시
   - 드래그앤드롭으로 위치 이동
   - [+ 멤버 추가] 버튼 (최대 9명)
   - 멤버 삭제: 노드 우클릭 → 삭제

 하단: 씬 설정 패널
   - 씬명 입력
   - 시작/끝 시간 입력
   - 조명 무드 색상 선택 (6가지 프리셋 칩)
   - 효과 선택: [스모그] [불꽃] [컨페티] [없음]

버튼:
 - [시뮬레이션 영상 생성] → POST /api/ai/performance/video → polling
 - [기획서 PDF 다운로드] → POST /api/ai/performance/pdf
 - [피드 게시]

상태관리 (Zustand):
interface PerformanceState {
  scenes: Scene[]
  selectedSceneId: string | null
  members: Member[]
}

API:
POST /api/ai/performance/video
  Request: { scenes, musicUrl?, style }
  처리: Replicate AnimateDiff
  Response: { jobId }

POST /api/ai/performance/pdf
  Request: { artistName, songTitle, scenes }
  처리: 서버에서 PDFKit으로 PDF 생성 → Supabase Storage 저장
  Response: { pdfUrl }
```

**완료 기준:**
- [ ] Konva 캔버스에서 멤버 드래그 이동
- [ ] 씬 추가/삭제 동작
- [ ] 씬 전환 시 포메이션 상태 유지
- [ ] 시뮬레이션 영상 생성 → 미리보기
- [ ] PDF 다운로드 동작

---

### Sprint 11 — AI 아이돌 프로젝트
**목표:** 5단계 스텝퍼, 세계관→멤버→제안서 자동 생성

**Claude Code 명령:**
```
AI 아이돌 프로젝트를 구현해줘. (/studio/idol-project)

진입 시 ArtistSelector 모달 (이번엔 "기존 아이돌 컨셉 기반" or "완전 오리지널" 선택)

5단계 스텝퍼 UI (상단 스텝 인디케이터):

Step 1: 세계관 기획
  - 세계관 키워드 텍스트에어리어
  - 분위기 셀렉트: 밝음/어두움/중립
  - [AI 세계관 생성] 버튼 → POST /api/ai/idol-project/generate { step: "worldbuilding" }
  - 결과: 세계관 스토리(200자) + 키워드 3개 + 비주얼 방향 표시 (수정 가능)

Step 2: 그룹 컨셉
  - 음악 장르 멀티셀렉트 (K-pop / R&B / 힙합 / 인디 / 일렉트로닉 / 팝)
  - 타깃 팬덤 셀렉트 (10대 / 20대 / 글로벌 / 전연령)
  - 활동 포맷 체크박스 (음원 / 무대 / 콘텐츠 / 굿즈)
  - 차별점 텍스트에어리어

Step 3: 그룹명 생성
  - [AI 그룹명 생성] → POST /api/ai/idol-project/generate { step: "groupname" }
  - 후보 10개 카드 표시 (이름 + 의미 + 로마자 표기)
  - 클릭으로 선택 or 직접 입력

Step 4: 멤버 구성
  - 인원수 슬라이더 (2~9명)
  - 인원수만큼 멤버 카드 동적 생성:
    * 멤버명(예명) 입력
    * 포지션 멀티셀렉트 (메인보컬/서브보컬/리드보컬/메인댄서/리드댄서/래퍼/비주얼/리더/막내)
    * 성격/캐릭터 텍스트에어리어
    * 국적/언어 셀렉트
  - [AI 멤버 구성 추천] 버튼 → 자동 포지션 균형 제안

Step 5: 비주얼 (선택)
  - 버추얼 스튜디오 연동: 멤버별 이미지 생성 버튼
  - 컨셉 스튜디오 연동: 그룹 로고 생성 버튼
  - [스킵] 버튼 항상 표시

완성: 제안서 미리보기
  - 자동 생성된 제안서 구조:
    1. 그룹 기본 정보
    2. 세계관 & 컨셉
    3. 멤버 프로필
    4. 로고 & 팀 컬러
    5. 음악 방향성
    6. 타깃 팬덤
  - [PDF 다운로드] POST /api/ai/idol-project/generate { step: "proposal" }
  - [커뮤니티 공개] → PublishModal
  - [저장만 하기]

상태: Zustand idolProjectStore로 전체 단계 데이터 유지 (새로고침 시 localStorage 복구)
```

**완료 기준:**
- [ ] 5단계 스텝퍼 앞뒤 이동
- [ ] 각 단계 AI 생성 동작
- [ ] 새로고침해도 입력 데이터 유지 (localStorage)
- [ ] 제안서 PDF 다운로드

---

### Sprint 12 — 글로벌 싱크
**목표:** 영상 소스 → 자막 생성 → 번역 → 편집 → 게시

**Claude Code 명령:**
```
글로벌 싱크를 구현해줘. (/studio/global-sync)

진입 시 ArtistSelector 모달 최우선 표시.

Step 1: 영상 소스
  - YouTube URL 입력 → 썸네일 미리보기 (oEmbed API)
  - 또는 MP4 파일 업로드 (FileUploader, 최대 500MB)

Step 2: 번역 설정
  - 원본 언어: "한국어" 고정 표시 (자동감지)
  - 번역 목표 언어 셀렉트 (10개 언어: 영어/일본어/중국어간체/번체/스페인어/포르투갈어/태국어/인도네시아어/베트남어/프랑스어)
  - [자막 생성 시작] → POST /api/ai/global-sync/transcribe → polling

Step 3: 자막 편집
  2단 레이아웃:
  좌: Video.js 플레이어 (영상 재생, 자막 오버레이)
  우: 자막 편집기
    - 자막 항목 목록 (타임스탬프 + 원본 한국어 + 번역 텍스트)
    - 각 항목: 번역 텍스트 수정 인풋
    - [전체 재번역] 버튼
    - [SRT 다운로드] 버튼

  번역 POST /api/ai/global-sync/translate
  Request: { subtitles: [{id, text}], targetLanguage }
  처리: DeepL API 일괄 번역

  [글로벌 싱크 피드 게시] → PublishModal (category: GLOBAL_SYNC)

지원 언어 상수:
const SUPPORTED_LANGUAGES = [
  { code: "en", name: "영어", flag: "🇺🇸" },
  { code: "ja", name: "일본어", flag: "🇯🇵" },
  { code: "zh-CN", name: "중국어(간체)", flag: "🇨🇳" },
  { code: "zh-TW", name: "중국어(번체)", flag: "🇹🇼" },
  { code: "es", name: "스페인어", flag: "🇪🇸" },
  { code: "pt", name: "포르투갈어", flag: "🇧🇷" },
  { code: "th", name: "태국어", flag: "🇹🇭" },
  { code: "id", name: "인도네시아어", flag: "🇮🇩" },
  { code: "vi", name: "베트남어", flag: "🇻🇳" },
  { code: "fr", name: "프랑스어", flag: "🇫🇷" }
]
```

**완료 기준:**
- [ ] YouTube URL 입력 → 썸네일 표시
- [ ] 음성→자막 생성 (Whisper API)
- [ ] 번역 결과 표시 + 수정 가능
- [ ] SRT 다운로드
- [ ] 피드 게시

---

### Sprint 13 — 프로필 & 아카이브
**목표:** 유저 프로필, 창작물 아카이브, 팔로우 시스템, 뱃지

**Claude Code 명령:**
```
프로필 & 아카이브를 구현해줘.

1. 내 프로필 (/profile)
   타인 프로필 (/profile/[userId])

   ProfileHeader:
   - 유저 아바타 (구글 프로필 사진 or 업로드 사진)
   - 닉네임 + 활동 유형 뱃지
   - 자기소개 (최대 150자)
   - 통계: 팔로워 수 / 팔로잉 수 / 창작물 수 / 총 조회수
   - [팔로우] 버튼 (타인 프로필 시, POST /api/users/:id/follow)
   - [프로필 편집] 버튼 (내 프로필 시)

   프로필 편집 모달:
   - 닉네임 변경 (중복 검사)
   - 자기소개 변경
   - 프로필 사진 업로드 (Supabase Storage)

   뱃지 섹션:
   - 획득 뱃지 아이콘 그리드
   - 미획득 뱃지: 흑백 + 잠금 아이콘 (조건 툴팁)
   - 뱃지 종류:
     첫 창작물 / 10개 창작물 / 100 반응 달성 / 첫 팔로워 / 글로벌 싱크 기여 / Pro 구독

   아카이브 그리드:
   - 탭: [전체] [리믹스] [버추얼] [컨셉] [퍼포먼스] [아이돌프로젝트] [글로벌싱크]
   - 3열 그리드 (썸네일 + 제목 + 반응 수)
   - 클릭 시 /post/:id

2. 팔로우 시스템 API:
   POST /api/users/[userId]/follow — 팔로우 토글
   GET  /api/users/[userId]/followers — 팔로워 목록
   GET  /api/users/[userId]/following — 팔로잉 목록

3. 뱃지 자동 지급 로직 (서버사이드):
   - 창작물 게시 시: 첫 창작물 체크 → UserBadge 생성
   - 반응 누적 시: 100 반응 달성 체크
   (API Route에서 부수 효과로 처리)
```

**완료 기준:**
- [ ] 프로필 사진 업로드 반영
- [ ] 창작물 아카이브 그리드 표시
- [ ] 팔로우/언팔로우 동작
- [ ] 뱃지 자동 지급 동작

---

### Sprint 14 — 결제 시스템 (Stripe)
**목표:** Pro 구독 결제, 웹훅 처리, 구독 상태 관리

**Claude Code 명령:**
```
Stripe 결제 시스템을 구현해줘.

1. Stripe 설정
   - lib/stripe.ts: Stripe 클라이언트 초기화
   - Pro 플랜: 월 9,900원 (KRW), Stripe Product/Price 생성 코드

2. 구독 플로우:
   사이드바 "Pro 업그레이드" 클릭
   → /pricing 페이지 (플랜 비교 테이블)
   → [Pro 시작하기] 버튼
   → POST /api/payments/create-checkout
   → Stripe Checkout 세션 생성 (successUrl: /payment/success, cancelUrl: /pricing)
   → Stripe 결제 페이지 이동
   → 결제 완료 → /payment/success 리다이렉트

3. Stripe 웹훅:
   POST /api/payments/webhook
   처리 이벤트:
   - checkout.session.completed: User.isPro = true, User.stripeCustomerId 저장, User.proExpiresAt 설정
   - customer.subscription.deleted: User.isPro = false
   - invoice.payment_failed: 실패 알림 이메일 발송 (lib/email.ts)

   웹훅 시그니처 검증 필수 (stripe.webhooks.constructEvent)

4. 구독 관리:
   GET /api/payments/subscription → 현재 구독 상태
   POST /api/payments/cancel → 구독 취소

5. Pro 기능 제한 (미들웨어 또는 API에서):
   - AI 생성 횟수: 무료 10회/월 (Redis로 카운트), Pro 무제한
   - 생성 횟수 초과 시: 409 응답 + "Pro로 업그레이드하면 무제한으로 사용할 수 있어요" 메시지

6. /pricing 페이지:
   Free / Pro 비교 테이블:
   | 기능 | Free | Pro |
   | AI 생성 횟수 | 10회/월 | 무제한 |
   | 이미지 해상도 | 720p | 4K |
   | 영상 길이 | 15초 | 60초 |
   | 광고 | 있음 | 없음 |
   | 우선 처리 | ❌ | ✅ |
```

**완료 기준:**
- [ ] Stripe Checkout 세션 생성 → 결제 페이지 이동
- [ ] 결제 완료 후 User.isPro = true 업데이트
- [ ] 구독 취소 후 isPro = false
- [ ] 무료 사용자 10회 초과 시 업그레이드 안내
- [ ] 웹훅 시그니처 검증 통과

---

### Sprint 15 — 어드민 대시보드
**목표:** 콘텐츠 관리, 유저 관리, 아티스트 관리

**Claude Code 명령:**
```
어드민 대시보드를 구현해줘. (/admin)

접근 제한: User.role === 'ADMIN'인 유저만 접근 (middleware.ts에서 처리)

1. /admin — 대시보드 홈
   KPI 카드 4개:
   - 총 유저 수 (오늘 신규)
   - 총 창작물 수 (오늘 신규)
   - 총 반응 수
   - Pro 구독자 수

   최근 7일 가입자 수 차트 (recharts LineChart)
   최근 창작물 목록 (10개)

2. /admin/users — 유저 관리
   테이블: 닉네임 / 이메일 / 가입일 / 활동유형 / Pro여부 / 역할
   기능:
   - 검색 (닉네임, 이메일)
   - 유저 ADMIN 권한 부여/해제 (PUT /api/admin/users/:id/role)
   - 유저 정지/해제 (PUT /api/admin/users/:id/status)

3. /admin/posts — 창작물 관리
   테이블: 제목 / 카테고리 / 작성자 / 생성일 / 반응 수 / 상태
   기능:
   - 카테고리 필터
   - 창작물 삭제 (DELETE /api/admin/posts/:id)
   - 공개/비공개 전환

4. /admin/artists — 아티스트 관리
   테이블: 아티스트명 / 소속사 / 팔로워 수 / 창작물 수
   기능:
   - 아티스트 추가 (POST /api/admin/artists)
   - 아티스트 대표 이미지 업로드 (Supabase Storage)
   - 아티스트 정보 수정
   - 아티스트 삭제

5. /admin/notices — 공지 관리
   - 아티스트별 공지 작성 (마크다운 에디터)
   - 공지 게시/삭제

API (모두 인증 + ADMIN 권한 검사):
GET  /api/admin/stats
GET  /api/admin/users
PUT  /api/admin/users/[id]/role
PUT  /api/admin/users/[id]/status
GET  /api/admin/posts
DELETE /api/admin/posts/[id]
GET  /api/admin/artists
POST /api/admin/artists
PUT  /api/admin/artists/[id]
DELETE /api/admin/artists/[id]
```

**완료 기준:**
- [ ] ADMIN이 아닌 유저 /admin 접근 시 403
- [ ] KPI 카드 실제 DB 데이터 표시
- [ ] 아티스트 이미지 업로드 후 아티스트 유니버스에 반영
- [ ] 창작물 삭제 시 피드에서 즉시 제거

---

### Sprint 16 — 보안 & Rate Limiting
**목표:** Rate Limit, CSRF, 입력 검증, 보안 헤더

**Claude Code 명령:**
```
보안 레이어를 구현해줘.

1. Rate Limiting (Upstash Redis + @upstash/ratelimit):
   적용 대상 및 한도:
   - /api/ai/* : 유저당 분당 5회 (Pro: 분당 20회)
   - /api/posts POST: 유저당 시간당 20회
   - /api/upload: 유저당 시간당 10회
   - /api/auth/* : IP당 분당 10회 (브루트포스 방지)

   초과 시: 429 응답 { error: { code: "RATE_LIMIT_EXCEEDED", message: "잠시 후 다시 시도해주세요" } }

2. 입력 검증 (Zod):
   모든 API Route의 Request Body를 Zod 스키마로 검증
   검증 실패 시: 400 응답 { error: { code: "VALIDATION_ERROR", message: 필드별 에러 메시지 } }

3. 보안 헤더 (next.config.js):
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Referrer-Policy: strict-origin-when-cross-origin
   Content-Security-Policy: 기본 정책

4. API 응답 공통 형식:
   성공: { success: true, data: T }
   실패: { success: false, error: { code: string, message: string } }

5. 파일 업로드 보안:
   - 파일 확장자 + MIME 타입 이중 검사
   - 파일명 sanitize (특수문자 제거)
   - Supabase Storage 경로: {bucket}/{userId}/{uuid}_{sanitizedName}
```

**완료 기준:**
- [ ] /api/ai/* 분당 5회 초과 시 429 응답
- [ ] 잘못된 요청 바디 시 400 + 한국어 에러 메시지
- [ ] 응답 헤더에 보안 헤더 포함
- [ ] 악성 파일명 업로드 시 sanitize 처리

---

### Sprint 17 — QA & 배포
**목표:** 최종 점검, 배포 설정

**Claude Code 명령:**
```
배포를 위한 최종 설정을 해줘.

1. next.config.js:
   - 보안 헤더 설정
   - 이미지 도메인 허용: lh3.googleusercontent.com (구글 프로필), supabase URL
   - Vercel 함수 타임아웃: /api/ai/* 300초, /api/upload 120초

2. vercel.json:
   {
     "functions": {
       "app/api/ai/**": { "maxDuration": 300 },
       "app/api/upload": { "maxDuration": 120 }
     }
   }

3. package.json scripts 추가:
   "build": "prisma generate && next build"
   "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"

4. Vercel 환경변수 설정 가이드 (README.md에 작성):
   [21. 환경변수 목록] 기준으로 Vercel Dashboard > Settings > Environment Variables에 추가

5. README.md 작성:
   - 로컬 개발 환경 세팅 방법
   - 환경변수 목록 및 획득 방법 (Supabase, Stripe, Google OAuth 등)
   - DB 마이그레이션 및 시드 실행 방법
   - 배포 방법
```

**완료 기준:**
- [ ] `npm run build` 에러 없이 완료
- [ ] Vercel 배포 성공
- [ ] Password Protection 활성화 확인
- [ ] 구글 로그인 → 온보딩 → 피드 전체 플로우 동작 확인
- [ ] 모바일(375px) 반응형 전 페이지 확인

---

## 3. 기술 스택 & 프로젝트 구조

### 기술 스택
```
Frontend:    Next.js 14 (App Router), TypeScript, Tailwind CSS
UI:          shadcn/ui, lucide-react
상태관리:    Zustand + TanStack Query v5
폼:          React Hook Form + Zod
오디오:      Wavesurfer.js
캔버스:      Konva.js + react-konva
영상:        Video.js
애니메이션:  CSS Transitions (배너 슬라이드)

Backend:     Next.js Route Handlers
DB:          PostgreSQL (Supabase)
ORM:         Prisma
스토리지:    Supabase Storage
캐시/Rate:   Upstash Redis
인증:        NextAuth v5 (Auth.js) + PrismaAdapter
이메일:      Resend
결제:        Stripe

AI:
  텍스트:    Anthropic Claude API (claude-sonnet-4-20250514)
  이미지:    Replicate (FLUX 1.1 Pro)
  음원분리:  Replicate (Demucs)
  음악생성:  Replicate (MusicGen)
  영상:      Replicate (AnimateDiff)
  번역:      DeepL API
  STT:       OpenAI Whisper API

배포:        Vercel
```

### 디렉토리 구조
```
fanmaker/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx              # 사이드바 + 헤더 공통 레이아웃
│   │   ├── feed/page.tsx           # 팬 유니버스 전체 피드
│   │   ├── artist/[artistId]/page.tsx  # 아티스트 유니버스
│   │   ├── post/[postId]/page.tsx  # 창작물 상세
│   │   ├── studio/
│   │   │   ├── page.tsx            # 스튜디오 허브
│   │   │   ├── remix/page.tsx
│   │   │   ├── virtual/page.tsx
│   │   │   ├── concept/page.tsx
│   │   │   ├── performance/page.tsx
│   │   │   ├── idol-project/page.tsx
│   │   │   └── global-sync/page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/page.tsx
│   │   └── pricing/page.tsx
│   ├── admin/
│   │   ├── layout.tsx              # 어드민 전용 레이아웃
│   │   ├── page.tsx                # 대시보드
│   │   ├── users/page.tsx
│   │   ├── posts/page.tsx
│   │   ├── artists/page.tsx
│   │   └── notices/page.tsx
│   ├── payment/
│   │   └── success/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── upload/route.ts
│       ├── posts/
│       │   ├── route.ts
│       │   └── [postId]/
│       │       ├── route.ts
│       │       ├── reactions/route.ts
│       │       └── comments/
│       │           ├── route.ts
│       │           └── [commentId]/route.ts
│       ├── users/
│       │   ├── check-nickname/route.ts
│       │   ├── me/route.ts
│       │   └── [userId]/
│       │       ├── route.ts
│       │       ├── follow/route.ts
│       │       ├── followers/route.ts
│       │       └── following/route.ts
│       ├── artists/
│       │   ├── route.ts
│       │   └── [artistId]/
│       │       ├── route.ts
│       │       ├── follow/route.ts
│       │       └── posts/route.ts
│       ├── ai/
│       │   ├── jobs/[jobId]/route.ts   # polling 엔드포인트
│       │   ├── remix/
│       │   │   ├── separate/route.ts
│       │   │   └── generate/route.ts
│       │   ├── virtual/generate/route.ts
│       │   ├── concept/generate/route.ts
│       │   ├── performance/
│       │   │   ├── video/route.ts
│       │   │   └── pdf/route.ts
│       │   ├── idol-project/generate/route.ts
│       │   └── global-sync/
│       │       ├── transcribe/route.ts
│       │       └── translate/route.ts
│       ├── payments/
│       │   ├── create-checkout/route.ts
│       │   ├── webhook/route.ts
│       │   ├── subscription/route.ts
│       │   └── cancel/route.ts
│       └── admin/
│           ├── stats/route.ts
│           ├── users/
│           │   └── [id]/
│           │       ├── role/route.ts
│           │       └── status/route.ts
│           ├── posts/[id]/route.ts
│           └── artists/
│               ├── route.ts
│               └── [id]/route.ts
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileTabBar.tsx
│   ├── feed/
│   │   ├── BannerSlider.tsx        # 자동슬라이드 배너
│   │   ├── FeedList.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostDetail.tsx
│   │   ├── ReactionBar.tsx
│   │   └── CommentSection.tsx
│   ├── artist/
│   │   ├── ArtistHero.tsx
│   │   ├── ArtistTabs.tsx
│   │   └── ArtistInfoPanel.tsx
│   ├── studio/
│   │   ├── remix/
│   │   ├── virtual/
│   │   ├── concept/
│   │   ├── performance/
│   │   ├── idol-project/
│   │   └── global-sync/
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── ArchiveGrid.tsx
│   │   └── BadgeSection.tsx
│   ├── payment/
│   │   └── PricingTable.tsx
│   └── common/
│       ├── ArtistSelector.tsx      # 스튜디오 진입 시 아티스트 선택
│       ├── AILoadingState.tsx
│       ├── PublishModal.tsx
│       ├── FileUploader.tsx
│       └── ErrorBoundary.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── supabase.ts
│   ├── redis.ts
│   ├── stripe.ts
│   ├── email.ts
│   ├── ai/
│   │   ├── claude.ts
│   │   ├── replicate.ts
│   │   ├── deepl.ts
│   │   └── whisper.ts
│   └── utils.ts
├── store/
│   ├── useStudioStore.ts
│   ├── useFeedStore.ts
│   └── useUserStore.ts
├── types/
│   ├── index.ts
│   ├── next-auth.d.ts
│   └── ai.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
├── next.config.js
└── vercel.json
```

---

## 4. 데이터베이스 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String       @id @default(cuid())
  email            String       @unique
  name             String?
  image            String?      // 구글 프로필 사진 URL
  nickname         String?      @unique
  bio              String?
  activityType     ActivityType @default(LIGHT)
  role             Role         @default(USER)
  onboardingDone   Boolean      @default(false)
  isPro            Boolean      @default(false)
  stripeCustomerId String?
  proExpiresAt     DateTime?
  aiUsageCount     Int          @default(0)   // 이번 달 AI 사용 횟수
  aiUsageResetAt   DateTime?                  // 사용량 초기화 일시
  language         String       @default("ko")
  isSuspended      Boolean      @default(false)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  accounts         Account[]
  sessions         Session[]
  posts            Post[]
  reactions        Reaction[]
  comments         Comment[]
  following        Follow[]     @relation("following")
  followers        Follow[]     @relation("followers")
  badges           UserBadge[]
  artistFollows    ArtistFollow[]
  votes            Vote[]
  aiJobs           AIJob[]
}

enum ActivityType { LIGHT CREATIVE GLOBAL CREATOR }
enum Role { USER ADMIN }

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Artist {
  id            String   @id @default(cuid())
  name          String
  nameEn        String?
  agency        String?
  groupImageUrl String?
  description   String?
  debutDate     DateTime?
  sns           Json?    // { youtube, instagram, twitter, tiktok }
  members       Json?    // [{ name, position, image }]
  createdAt     DateTime @default(now())

  posts         Post[]
  artistFollows ArtistFollow[]
  notices       Notice[]
}

model ArtistFollow {
  userId    String
  artistId  String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  artist    Artist   @relation(fields: [artistId], references: [id])
  @@id([userId, artistId])
}

model Post {
  id           String       @id @default(cuid())
  authorId     String
  artistId     String?
  category     PostCategory
  title        String
  description  String?
  thumbnailUrl String?
  contentData  Json
  fileUrls     String[]
  tags         String[]
  isPublic     Boolean      @default(true)
  viewCount    Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  author       User         @relation(fields: [authorId], references: [id])
  artist       Artist?      @relation(fields: [artistId], references: [id])
  reactions    Reaction[]
  comments     Comment[]
  votes        Vote[]
}

enum PostCategory {
  REMIX
  VIRTUAL
  CONCEPT
  PERFORMANCE
  IDOL_PROJECT
  GLOBAL_SYNC
}

model Reaction {
  id       String       @id @default(cuid())
  postId   String
  userId   String
  type     ReactionType
  post     Post         @relation(fields: [postId], references: [id], onDelete: Cascade)
  user     User         @relation(fields: [userId], references: [id])
  @@unique([postId, userId, type])
}

enum ReactionType { LIKE CHEER WOW }

model Comment {
  id        String    @id @default(cuid())
  postId    String
  authorId  String
  parentId  String?
  content   String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User      @relation(fields: [authorId], references: [id])
  parent    Comment?  @relation("replies", fields: [parentId], references: [id])
  replies   Comment[] @relation("replies")
}

model Vote {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  voteType  VoteType
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
  @@unique([postId, userId])
}

enum VoteType { EXPECTATION ATTENTION }

model Follow {
  followerId  String
  followingId String
  createdAt   DateTime @default(now())
  follower    User     @relation("following", fields: [followerId], references: [id])
  following   User     @relation("followers", fields: [followingId], references: [id])
  @@id([followerId, followingId])
}

model Badge {
  id          String      @id @default(cuid())
  name        String
  description String
  imageUrl    String
  condition   String
  userBadges  UserBadge[]
}

model UserBadge {
  userId    String
  badgeId   String
  awardedAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  badge     Badge    @relation(fields: [badgeId], references: [id])
  @@id([userId, badgeId])
}

model AIJob {
  id         String    @id @default(cuid())
  userId     String
  type       AIJobType
  status     JobStatus @default(PENDING)
  inputData  Json
  outputData Json?
  error      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  user       User      @relation(fields: [userId], references: [id])
}

enum AIJobType {
  REMIX_SEPARATE
  REMIX_GENERATE
  VIRTUAL_GENERATE
  CONCEPT_LOGO
  CONCEPT_COVER
  CONCEPT_KEYVISUAL
  PERFORMANCE_VIDEO
  IDOL_TEXT
  SYNC_TRANSCRIBE
  SYNC_TRANSLATE
}

enum JobStatus { PENDING PROCESSING COMPLETED FAILED }

model Notice {
  id        String   @id @default(cuid())
  artistId  String?
  title     String
  content   String   @db.Text
  isPublic  Boolean  @default(true)
  createdAt DateTime @default(now())
  artist    Artist?  @relation(fields: [artistId], references: [id])
}
```

---

## 5. 인증 시스템

### 지원 Provider
- **Google OAuth 2.0** — 로그인 시 name, email, image(프로필 사진) 자동 저장
- **Apple OAuth 2.0**

### 세션 타입 확장
```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image: string         // 구글 프로필 사진 URL
      nickname: string
      activityType: ActivityType
      role: Role
      isPro: boolean
      onboardingDone: boolean
    }
  }
}
```

### 인증 흐름
```
최초 로그인:
소셜 로그인 → DB User 생성 (image 필드에 구글 프로필 사진 URL 저장)
→ onboardingDone=false 확인 → /onboarding 리다이렉트
→ 온보딩 완료 → onboardingDone=true → 환영 이메일 발송 → /feed

재방문:
소셜 로그인 → onboardingDone=true → /feed 바로 이동
```

### 미들웨어 보호 경로
```
/studio/*        → USER 이상
/profile/*       → USER 이상
/admin/*         → ADMIN만
/api/ai/*        → USER 이상 (+ isSuspended 체크)
/api/posts POST  → USER 이상
```

---

## 6. 이메일 발송 시스템

### Resend 기반 트랜잭션 이메일

| 함수명 | 트리거 | 제목 |
|--------|--------|------|
| sendWelcomeEmail | 온보딩 완료 | 팬메이커에 오신 걸 환영해요 🎤 |
| sendReactionNotificationEmail | 반응 누적 100개 | 내 창작물에 반응이 쏟아지고 있어요 ✨ |
| sendCommentNotificationEmail | 댓글 작성 | 새 댓글이 달렸어요 💬 |
| sendPaymentFailedEmail | Stripe 결제 실패 | 결제에 문제가 생겼어요 |

- 발송자: `noreply@fanmaker.app`
- 실패 시: 에러 로그만, 서비스 중단 없음

---

## 7. 결제 시스템

### Stripe 플로우
```
사이드바 Pro 배너 클릭
→ /pricing (Free vs Pro 비교 테이블)
→ [Pro 시작하기] → POST /api/payments/create-checkout
→ Stripe Checkout 세션 (mode: subscription, KRW 9,900/월)
→ 결제 완료 → /payment/success → User.isPro = true
→ 구독 취소 → User.isPro = false
```

### 웹훅 이벤트 처리
| 이벤트 | 처리 |
|--------|------|
| checkout.session.completed | isPro=true, stripeCustomerId 저장 |
| customer.subscription.deleted | isPro=false |
| invoice.payment_failed | 실패 알림 이메일 |

### AI 사용량 제한
- 무료: 월 10회 (Redis 카운터)
- Pro: 무제한
- 매월 1일 0시 카운터 초기화

---

## 8. 서버 & 인프라 세팅

### Supabase 설정
```
프로젝트 생성 → Settings > Database > Connection string 복사 → DATABASE_URL
Storage > Buckets 생성:
  - audio (공개)
  - images (공개)
  - videos (공개)
Auth > URL Configuration: Site URL = Vercel 배포 URL
```

### Upstash Redis 설정
```
Upstash 콘솔 → Redis 데이터베이스 생성
→ REST URL, REST Token 복사 → .env에 추가
```

### Stripe 설정
```
Stripe 대시보드 → Products → 팬메이커 Pro 상품 생성
가격: 9,900 KRW / 월 / recurring
→ Price ID 복사 → .env에 추가
Developers → Webhooks → 엔드포인트 추가: {DOMAIN}/api/payments/webhook
이벤트: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
→ Signing Secret 복사
```

### Google OAuth 설정
```
Google Cloud Console → APIs & Services → Credentials
→ OAuth 2.0 Client ID 생성
승인된 리다이렉트 URI:
  http://localhost:3000/api/auth/callback/google
  https://{VERCEL_DOMAIN}/api/auth/callback/google
```

### Apple OAuth 설정
```
Apple Developer → Certificates, IDs & Profiles → Services IDs
→ Sign In with Apple 구성
리다이렉트 URL: https://{VERCEL_DOMAIN}/api/auth/callback/apple
```

---

## 9. 어드민 모드

### 접근 제어
- URL: `/admin/*`
- 조건: `User.role === 'ADMIN'`
- 최초 어드민 지정: Prisma Studio 또는 시드에서 직접 role='ADMIN' 업데이트

### 기능 목록
| 페이지 | 기능 |
|--------|------|
| /admin | KPI 카드, 가입자 추이 차트, 최근 창작물 |
| /admin/users | 유저 목록, 검색, ADMIN 부여, 정지 처리 |
| /admin/posts | 창작물 목록, 카테고리 필터, 삭제, 공개/비공개 |
| /admin/artists | 아티스트 추가/수정/삭제, 대표 이미지 업로드 |
| /admin/notices | 아티스트별 공지 작성/삭제 |

---

## 10. 보안

### Rate Limiting
| 엔드포인트 | 무료 | Pro |
|------------|------|-----|
| /api/ai/* | 분당 5회 | 분당 20회 |
| /api/posts POST | 시간당 20회 | 시간당 50회 |
| /api/upload | 시간당 10회 | 시간당 30회 |
| /api/auth/* | IP당 분당 10회 | — |

### 보안 헤더 (next.config.js)
```javascript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 파일 업로드 보안
- 확장자 + MIME 타입 이중 검사
- 파일명 sanitize
- 경로: `{bucket}/{userId}/{uuid}_{sanitizedName}`

---

## 11. 홈 & 네비게이션

### 자동슬라이드 배너 (BannerSlider.tsx)
- 위치: `/feed` 페이지 최상단
- 6개 슬라이드, 3초 자동 전환
- 마우스 호버 시 일시정지
- 하단 인디케이터 도트 + 좌우 화살표
- 높이: 데스크톱 420px / 모바일 240px

| 슬라이드 | 제목 | 바로가기 |
|----------|------|---------|
| 1 | 내가 직접 만드는 K-pop 리믹스 | /studio/remix |
| 2 | 나만의 버추얼 아이돌 디자인 | /studio/virtual |
| 3 | 다음 앨범 컨셉, 팬이 먼저 만든다 | /studio/concept |
| 4 | 무대 위 퍼포먼스를 직접 기획 | /studio/performance |
| 5 | 새로운 아이돌 그룹을 창조해보세요 | /studio/idol-project |
| 6 | K-pop을 전 세계 언어로 | /studio/global-sync |

### 아티스트 선택 우선 정책
- **모든 스튜디오 기능 진입 시** ArtistSelector 모달이 최우선으로 표시됨
- 모달 내 옵션: 아티스트 그리드 선택 + "오리지널 창작 (아티스트 없음)" 버튼
- 선택 완료 후 스튜디오 편집 화면으로 진입
- 선택한 아티스트는 해당 스튜디오 세션 동안 context에 유지

---

## 12. 팬 유니버스 전체 피드

### 페이지: `/feed`

### 구성
```
자동슬라이드 배너 (Sprint 4)
↓
탭: [전체] [팔로잉] [트렌딩]
카테고리 필터 칩 (가로 스크롤)
아티스트 필터 칩 (가로 스크롤: 전체 + 20개 아티스트)
↓
PostCard 무한 스크롤 피드
```

### 탭 동작
- **전체**: 모든 공개 창작물, 최신순/인기순
- **팔로잉**: 내가 팔로우하는 유저의 창작물
- **트렌딩**: 24시간 내 반응 수 기준 상위 창작물

### PostCard 구성
- 썸네일 이미지
- 카테고리 뱃지 (색상 구분)
- 제목
- 작성자 프로필 사진 + 닉네임 + 상대 시간 ("3분 전")
- 반응 버튼: ❤️ 좋아요 / 📣 응원 / 😮 놀라움 (토글)
- 💬 댓글 수, 👁 조회수

---

## 13. 아티스트 유니버스

### 페이지: `/artist/[artistId]`

### 구성 (Weverse 구조 참고)
```
히어로 섹션 (전체 너비 400px 높이 커버 이미지 + 아티스트명)
[팔로우] 버튼
↓
탭 고정 네비게이션: Highlight / Fan / Notice
↓
2단 레이아웃 (데스크톱):
  좌 65%: 창작물 피드 (해당 아티스트 태그된 것만)
  우 35%: 아티스트 정보 패널
    - 로고/썸네일
    - SNS 아이콘 링크
    - 소속사, 데뷔일
    - 멤버 목록 (아코디언)
    - 팔로워 수
```

### 탭별 콘텐츠
- **Highlight**: 인기 창작물 상위 노출 + Fan Posts 믹스
- **Fan**: 해당 아티스트 창작물 전체 (필터/정렬)
- **Notice**: 어드민 작성 공지 (일반 유저는 읽기만)

---

## 14. AI 창작 스튜디오

공통 규칙:
1. 모든 스튜디오 진입 시 ArtistSelector 모달 최우선 표시
2. AI 생성 → AIJob 생성 → jobId polling (3초 간격)
3. 생성 중 AILoadingState (예상 시간 카운트다운)
4. 완료 → PublishModal → 피드 게시

### 14.1 리믹스 스튜디오 (/studio/remix)
- 음원 업로드 (MP3/WAV/AAC, 50MB) → Wavesurfer.js 파형
- BPM 슬라이더 (60~200) + 키 조정 (-6~+6 반음)
- [파트 분리] → Replicate Demucs
- AI 리믹스 스타일 3개 (댄스팝/어쿠스틱/신스웨이브) → Replicate MusicGen

### 14.2 버추얼 스튜디오 (/studio/virtual)
- 성별/피부톤/스타일 프리셋 선택 + 추가 묘사
- AI 이미지 생성 → Replicate FLUX 1.1 Pro
- 좌우 분할: 편집 패널 | 실시간 프리뷰

### 14.3 컨셉 스튜디오 (/studio/concept)
- 아티스트명 + 무드 + 키워드 + 색상 입력
- 로고 5개 + 앨범커버 + 키비주얼 병렬 생성
- 무드보드 자동 배치 + 전체 ZIP 다운로드

---

## 15. AI 퍼포먼스 플래너

### 페이지: `/studio/performance`
- Konva.js 탑뷰 캔버스 (600x400px)
- 멤버 드래그앤드롭 포메이션
- 씬 타임라인 (씬명 + 시간 범위 + 조명/효과)
- 시뮬레이션 영상 생성 (Replicate AnimateDiff, 15초)
- 기획서 PDF 다운로드 (PDFKit)

---

## 16. AI 아이돌 프로젝트

### 페이지: `/studio/idol-project`
- 5단계 스텝퍼: 세계관 → 컨셉 → 그룹명 → 멤버 → 비주얼
- 각 단계 입력값 localStorage 저장 (새로고침 복구)
- 최종 제안서 PDF 자동 생성
- 커뮤니티 공개 → 피드 게시

---

## 17. 글로벌 싱크

### 페이지: `/studio/global-sync`
- YouTube URL or MP4 업로드 (500MB)
- Whisper API → 한국어 자막 생성
- DeepL API → 10개 언어 번역
- Video.js 플레이어 + 자막 편집기 2단 레이아웃
- SRT 파일 다운로드
- 피드 게시 (category: GLOBAL_SYNC)

---

## 18. 프로필 & 아카이브

### 내 프로필 (/profile)
- 구글 프로필 사진 or 업로드 사진
- 닉네임, 자기소개, 활동 유형 뱃지
- 통계: 팔로워/팔로잉/창작물/총 조회수
- 뱃지 섹션 (미획득 뱃지 잠금 표시)
- 창작물 아카이브 그리드 (카테고리 탭 필터)

### 타인 프로필 (/profile/[userId])
- [팔로우/언팔로우] 버튼

### 뱃지 목록
| 뱃지 | 지급 조건 |
|------|-----------|
| 첫 창작물 | 첫 번째 창작물 게시 |
| 10개 창작물 | 10개 게시 |
| 100 반응 | 받은 반응 합계 100개 |
| 첫 팔로워 | 팔로워 1명 달성 |
| 글로벌 기여 | 글로벌 싱크 첫 게시 |
| Pro 멤버 | Pro 구독 중 |

---

## 19. API 전체 명세

### 공통 응답 형식
```typescript
// 성공
{ success: true, data: T }

// 실패
{ success: false, error: { code: string, message: string } }
```

### AI Job Polling 패턴
```typescript
const pollJob = async (jobId: string, onSuccess, onError) => {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/ai/jobs/${jobId}`)
    const { data } = await res.json()
    if (data.status === "COMPLETED") { clearInterval(interval); onSuccess(data.output) }
    if (data.status === "FAILED") { clearInterval(interval); onError(data.error) }
  }, 3000)
  setTimeout(() => { clearInterval(interval); onError("시간 초과") }, 5 * 60 * 1000)
}
```

### 전체 API 목록
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | /api/auth/[...nextauth] | NextAuth | — |
| GET | /api/posts | 피드 목록 | 선택 |
| POST | /api/posts | 창작물 게시 | 필수 |
| GET | /api/posts/[id] | 상세 | 선택 |
| DELETE | /api/posts/[id] | 삭제 (본인) | 필수 |
| POST | /api/posts/[id]/reactions | 반응 토글 | 필수 |
| GET | /api/posts/[id]/comments | 댓글 목록 | 선택 |
| POST | /api/posts/[id]/comments | 댓글 작성 | 필수 |
| DELETE | /api/posts/[id]/comments/[cid] | 댓글 삭제 | 필수 |
| GET | /api/users/check-nickname | 닉네임 중복확인 | — |
| GET | /api/users/me | 내 정보 | 필수 |
| PUT | /api/users/me | 내 프로필 수정 | 필수 |
| POST | /api/users/[id]/follow | 팔로우 토글 | 필수 |
| GET | /api/artists | 아티스트 목록 | — |
| GET | /api/artists/[id] | 아티스트 상세 | — |
| POST | /api/artists/[id]/follow | 아티스트 팔로우 | 필수 |
| GET | /api/artists/[id]/posts | 아티스트 창작물 | — |
| POST | /api/upload | 파일 업로드 | 필수 |
| GET | /api/ai/jobs/[jobId] | AI 작업 상태 | 필수 |
| POST | /api/ai/remix/separate | 음원 분리 | 필수 |
| POST | /api/ai/remix/generate | AI 리믹스 | 필수 |
| POST | /api/ai/virtual/generate | 캐릭터 생성 | 필수 |
| POST | /api/ai/concept/generate | 컨셉 키트 생성 | 필수 |
| POST | /api/ai/performance/video | 시뮬레이션 영상 | 필수 |
| POST | /api/ai/performance/pdf | 기획서 PDF | 필수 |
| POST | /api/ai/idol-project/generate | 아이돌 기획 | 필수 |
| POST | /api/ai/global-sync/transcribe | STT 자막 | 필수 |
| POST | /api/ai/global-sync/translate | 번역 | 필수 |
| POST | /api/payments/create-checkout | Stripe Checkout | 필수 |
| POST | /api/payments/webhook | Stripe 웹훅 | — |
| GET | /api/payments/subscription | 구독 상태 | 필수 |
| POST | /api/payments/cancel | 구독 취소 | 필수 |
| GET | /api/admin/stats | 어드민 통계 | ADMIN |
| GET | /api/admin/users | 유저 목록 | ADMIN |
| PUT | /api/admin/users/[id]/role | 역할 변경 | ADMIN |
| PUT | /api/admin/users/[id]/status | 정지/해제 | ADMIN |
| GET | /api/admin/posts | 창작물 목록 | ADMIN |
| DELETE | /api/admin/posts/[id] | 창작물 삭제 | ADMIN |
| GET | /api/admin/artists | 아티스트 목록 | ADMIN |
| POST | /api/admin/artists | 아티스트 추가 | ADMIN |
| PUT | /api/admin/artists/[id] | 아티스트 수정 | ADMIN |
| DELETE | /api/admin/artists/[id] | 아티스트 삭제 | ADMIN |

---

## 20. 에러 처리 & QA 체크리스트

### 에러 코드 정의
| 코드 | HTTP | 사용자 메시지 |
|------|------|---------------|
| UNAUTHORIZED | 401 | "로그인이 필요한 기능이에요" |
| FORBIDDEN | 403 | "접근 권한이 없어요" |
| NOT_FOUND | 404 | "찾을 수 없는 페이지예요" |
| VALIDATION_ERROR | 400 | 필드별 한국어 메시지 |
| FILE_TOO_LARGE | 400 | "파일 크기는 {N}MB 이하여야 해요" |
| UNSUPPORTED_FORMAT | 400 | "{formats} 파일만 업로드할 수 있어요" |
| AI_RATE_LIMIT | 429 | "AI 생성 한도를 초과했어요. Pro로 업그레이드하면 무제한으로 사용할 수 있어요" |
| RATE_LIMIT_EXCEEDED | 429 | "잠시 후 다시 시도해주세요" |
| AI_GENERATION_FAILED | 500 | "AI 생성 중 오류가 발생했어요. 다시 시도해주세요" |
| AI_TIMEOUT | 408 | "AI 생성 시간이 초과되었어요. 다시 시도해주세요" |
| UPLOAD_FAILED | 500 | "파일 업로드 중 오류가 발생했어요" |
| SERVER_ERROR | 500 | "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요" |

### QA 체크리스트

**인증**
- [ ] 구글 로그인 후 헤더에 구글 프로필 사진 표시
- [ ] 최초 로그인 → 온보딩 3단계 완료 → /feed 이동
- [ ] 환영 이메일 수신
- [ ] 비로그인 상태로 /studio 접근 → /login 리다이렉트

**피드**
- [ ] 배너 6개 슬라이드 자동 전환 (3초)
- [ ] 피드 무한 스크롤 (20개씩)
- [ ] 반응 버튼 토글 즉시 반영
- [ ] 댓글 작성/삭제

**아티스트 유니버스**
- [ ] 아티스트 클릭 → /artist/:id 이동
- [ ] 탭 전환 (Highlight/Fan/Notice)
- [ ] 팔로우 토글

**스튜디오 공통**
- [ ] 진입 시 ArtistSelector 모달 먼저 표시
- [ ] AI 생성 중 로딩 UI
- [ ] 생성 완료 → 결과 표시
- [ ] 피드 게시 동작

**결제**
- [ ] Stripe Checkout → 결제 완료 → isPro=true
- [ ] 무료 사용자 10회 초과 → 업그레이드 안내
- [ ] 구독 취소 동작

**어드민**
- [ ] 일반 유저 /admin 접근 차단
- [ ] KPI 카드 실제 데이터 표시
- [ ] 아티스트 이미지 업로드 → 아티스트 유니버스 반영

**보안**
- [ ] /api/ai/* 분당 5회 초과 → 429
- [ ] 50MB 초과 파일 업로드 → 에러

**모바일**
- [ ] 375px 기준 전 페이지 레이아웃 깨짐 없음
- [ ] 하단 탭바 표시

---

## 21. 환경변수 목록

```bash
# .env.local

# 데이터베이스 (Supabase)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."                    # openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Apple OAuth
APPLE_ID="..."
APPLE_TEAM_ID="..."
APPLE_PRIVATE_KEY="..."
APPLE_KEY_ID="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Upstash Redis
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# AI 서비스
ANTHROPIC_API_KEY="..."
REPLICATE_API_TOKEN="..."
OPENAI_API_KEY="..."
DEEPL_API_KEY="..."

# 결제 (Stripe)
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
STRIPE_PRO_PRICE_ID="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."

# 이메일 (Resend)
RESEND_API_KEY="..."

# 앱 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 22. 배포 & 보안 설정

### vercel.json
```json
{
  "functions": {
    "app/api/ai/**": { "maxDuration": 300 },
    "app/api/upload": { "maxDuration": 120 },
    "app/api/payments/webhook": { "maxDuration": 30 }
  }
}
```

### next.config.js
```javascript
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",   // 구글 프로필 사진
      "your-project.supabase.co",     // Supabase Storage
    ]
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ]
    }]
  }
}
module.exports = nextConfig
```

### 배포 절차
```bash
# 1. Vercel 배포
git push origin main  # 자동 배포 트리거

# 2. Vercel Dashboard > Settings > Environment Variables
#    21번 환경변수 전체 입력

# 3. DB 마이그레이션
npx prisma migrate deploy

# 4. 시드 데이터 삽입 (최초 1회)
npx prisma db seed

# 5. Vercel Dashboard > Settings > Security > Password Protection 활성화
#    비밀번호 설정 후 대표님께 공유

# 6. Stripe 웹훅 URL 업데이트
#    https://{VERCEL_DOMAIN}/api/payments/webhook
```

### 초기 어드민 설정
```bash
# 배포 후 Prisma Studio 또는 직접 SQL로 어드민 지정
# Supabase SQL Editor:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0 | 2026.03 | 초안 |
| 2.0 | 2026.03 | Claude Code 개발용 상세 명세 추가 |
| 3.0 | 2026.03 | 전체 재구성. 개발 Sprint 순서 추가, 인증/이메일/결제/서버/어드민/보안 상세화, 자동슬라이드 배너, 아티스트 유니버스(Weverse 구조), 아티스트 선택 우선 정책, NCT WISH로 시드 데이터 수정 |
