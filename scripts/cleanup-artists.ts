import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DUPLICATE_NAMES = [
  "(G)I-DLE", "aespa", "BLACKPINK", "BTS", "ENHYPEN", "EXO",
  "GOT7", "IVE", "LE SSERAFIM", "LNGSHOT", "MAMAMOO", "MONSTA X",
  "NCT WISH", "NewJeans", "Red Velvet", "SEVENTEEN", "SHINee",
  "Stray Kids", "TWICE", "TXT",
];

const DELETE_ENTIRELY = ["GOT7", "TXT", "MAMAMOO", "MONSTA X"];

async function main() {
  console.log("=== 아티스트 중복 제거 시작 ===\n");

  // 1단계: 중복 레코드 제거 (오래된 것 1개만 남김)
  for (const name of DUPLICATE_NAMES) {
    const artists = await prisma.artist.findMany({
      where: { name },
      orderBy: { createdAt: "asc" },
    });

    if (artists.length <= 1) {
      console.log(`[SKIP] ${name}: ${artists.length}개 (중복 없음)`);
      continue;
    }

    // 첫 번째(가장 오래된) 레코드만 남기고 나머지 삭제
    const keepId = artists[0].id;
    const deleteIds = artists.slice(1).map((a) => a.id);

    // 삭제 대상의 연관 데이터 먼저 제거
    for (const id of deleteIds) {
      await prisma.artistFollow.deleteMany({ where: { artistId: id } });
      await prisma.post.deleteMany({ where: { artistId: id } });
    }

    await prisma.artist.deleteMany({
      where: { id: { in: deleteIds } },
    });

    console.log(`[DEDUP] ${name}: ${artists.length}개 → 1개 (${deleteIds.length}개 삭제, 유지: ${keepId})`);
  }

  // 2단계: GOT7, TXT, MAMAMOO, MONSTA X 완전 삭제
  console.log("\n=== 특정 아티스트 완전 삭제 ===\n");

  for (const name of DELETE_ENTIRELY) {
    const artists = await prisma.artist.findMany({ where: { name } });

    if (artists.length === 0) {
      console.log(`[SKIP] ${name}: 이미 없음`);
      continue;
    }

    for (const artist of artists) {
      await prisma.artistFollow.deleteMany({ where: { artistId: artist.id } });
      await prisma.post.deleteMany({ where: { artistId: artist.id } });
    }

    const result = await prisma.artist.deleteMany({ where: { name } });
    console.log(`[DELETE] ${name}: ${result.count}개 삭제 완료`);
  }

  // 결과 확인
  console.log("\n=== 최종 아티스트 목록 ===\n");
  const remaining = await prisma.artist.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  remaining.forEach((a, i) => console.log(`${i + 1}. ${a.name} (${a.id})`));
  console.log(`\n총 ${remaining.length}개 아티스트`);
}

main()
  .catch((e) => {
    console.error("에러 발생:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
