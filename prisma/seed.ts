import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const regionNames = [
  "부산",
  "경기",
  "충북",
  "대구",
  "세종",
  "전남",
  "서울",
  "울산",
  "충남",
  "강원",
  "제주",
  "경남",
  "전북",
  "대전",
  "경북",
  "인천",
  "광주",
];

async function main(): Promise<void> {
  // 지역 데이터 삽입
  const regions: { id: string; regionName: string }[] = [];
  for (const regionName of regionNames) {
    const region = await prisma.region.upsert({
      where: { regionName },
      update: {},
      create: { regionName },
    });
    regions.push(region);
  }

  console.log("🌱 Seed Regions completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
