import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const artists = [
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
  { name: "LNGSHOT", nameEn: "LNGSHOT", agency: "MORE VISION" },
];

async function main() {
  console.log("Seeding artists...");

  for (const artist of artists) {
    await prisma.artist.upsert({
      where: { id: artist.name }, // fallback - will create if not found
      update: {},
      create: {
        name: artist.name,
        nameEn: artist.nameEn,
        agency: artist.agency,
        groupImageUrl: null,
      },
    });
  }

  // upsert는 unique 필드가 필요하므로 createMany + skipDuplicates 사용
  const existingArtists = await prisma.artist.findMany({
    select: { name: true },
  });
  const existingNames = new Set(existingArtists.map((a) => a.name));

  const newArtists = artists.filter((a) => !existingNames.has(a.name));

  if (newArtists.length > 0) {
    await prisma.artist.createMany({
      data: newArtists.map((a) => ({
        name: a.name,
        nameEn: a.nameEn,
        agency: a.agency,
        groupImageUrl: null,
      })),
      skipDuplicates: true,
    });
  }

  const count = await prisma.artist.count();
  console.log(`Seeding complete. Total artists: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
