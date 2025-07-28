import { PrismaClient, MoveType, EstimateStatus } from "@prisma/client";
import bcrypt from "bcrypt";

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

const clientNames = ["양성경", "김수경", "신수민", "심유빈", "임정빈", "오하영", "홍성훈"];

const moverNames = [
  "류제천",
  "강서진",
  "민시우",
  "서지우",
  "이동현",
  "김민성",
  "박다온",
  "최나윤",
  "윤승우",
  "정지후",
  "임도현",
  "노하윤",
  "배지우",
  "이수민",
  "조서하",
  "안현수",
  "구예준",
  "유지호",
  "황윤호",
  "신지민",
];

const BCRYPT_SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "password1";

// date-fns의 addDays 대체 함수(UTC 기준 날짜 연산)
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function getHashedPassword(): Promise<string> {
  return await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_SALT_ROUNDS);
}

async function main(): Promise<void> {
  // 외래키 의존성 역순으로 삭제
  await prisma.$executeRawUnsafe(`
  TRUNCATE TABLE "Favorite", "Review", "Estimate", "DesignatedRequest", "Request", "Mover", "Client", "Region"
  RESTART IDENTITY CASCADE;
`);

  // 1. 리전(지역) 보장
  const regions: { id: string; regionName: string }[] = [];
  for (const regionName of regionNames) {
    const region = await prisma.region.upsert({
      where: { regionName },
      update: {},
      create: { regionName },
    });
    regions.push(region);
  }

  const hashedPassword = await getHashedPassword();

  // 2. 무버(Mover) 생성
  for (let i = 0; i < moverNames.length; i++) {
    await prisma.mover.upsert({
      where: { email: `mover${i + 1}@gmail.com` },
      update: {},
      create: {
        email: `mover${i + 1}@gmail.com`,
        name: moverNames[i],
        nickName: `${moverNames[i]}짱`,
        phone: `010123410${(i + 1).toString().padStart(2, "0")}`,
        hashedPassword,
        career: i + 1,
        introduction: `안녕하세요 ${moverNames[i]} 기사입니다.`,
        description: `안녕하세요. 이사업계 경력 ${i + 1}년으로 안전한 이사를 도와드리는 ${
          moverNames[i]
        }입니다. 고객님의 물품을 소중하고 안전하게 운송하여 드립니다. 소형이사 및 가정이사 서비스를 제공합니다.`,
        serviceType: [MoveType.SMALL, MoveType.HOME],
        favoriteCount: i + 1,
        estimateCount: i + 10,
        averageReviewRating: 5.0,
        reviewCount: i + 100,
        serviceArea: { connect: [{ id: regions[i % regions.length].id }] },
        isProfileCompleted: true,
      },
    });
  }

  // 3. 클라이언트(Client) 생성
  for (let i = 0; i < clientNames.length; i++) {
    await prisma.client.upsert({
      where: { email: `client${i + 1}@gmail.com` },
      update: {},
      create: {
        email: `client${i + 1}@gmail.com`,
        name: clientNames[i],
        phone: `010123400${(i + 1).toString().padStart(2, "0")}`,
        hashedPassword,
        serviceType: [MoveType.SMALL, MoveType.HOME],
        livingArea: { connect: [{ id: regions[i % regions.length].id }] },
        isProfileCompleted: true,
      },
    });
  }

  // 4. 무버/클라이언트 목록 확보
  const allMovers = await prisma.mover.findMany();
  const allClients = await prisma.client.findMany();

  // '류제천', '양성경' 선택
  const ryooMover = await prisma.mover.findFirst({ where: { name: "류제천" } });
  const yangClient = await prisma.client.findFirst({ where: { name: "양성경" } });

  // 5. 각 클라이언트(양성경 제외)에 isPending==true 요청 생성
  for (const client of allClients.filter((c) => c.name !== "양성경")) {
    const exist = await prisma.request.findFirst({
      where: { clientId: client.id, isPending: true },
    });
    if (!exist) {
      for (let i = 0; i < allClients.length; i++) {
        await prisma.request.create({
          data: {
            clientId: client.id,
            moveType: MoveType.HOME,
            moveDate: addDays(new Date(), 1 + i),
            fromAddress: `서울 중구 난계로 ${i + 1}`,
            toAddress: `경기 수원시 팔달구 갓메산로 ${i + 1}`,
            isPending: true,
          },
        });
      }
    }
  }

  // 6. 양성경 특수 로직
  if (yangClient) {
    // (A) isPending==true request 생성 or 재사용
    const yangTrueRequest =
      (await prisma.request.findFirst({
        where: { clientId: yangClient.id, isPending: true },
      })) ||
      (await prisma.request.create({
        data: {
          clientId: yangClient.id,
          moveType: MoveType.SMALL,
          moveDate: new Date(),
          fromAddress: "서울 중구 삼일대로 343",
          toAddress: "서울 중구 청계천로 100",
          isPending: true,
        },
      }));

    // (B) 과거 20개 요청 보장 + 견적 생성(중복 불가)
    let oldRequests = await prisma.request.findMany({
      where: { clientId: yangClient.id, isPending: false },
      orderBy: { moveDate: "asc" },
    });

    while (oldRequests.length < 20) {
      const req = await prisma.request.create({
        data: {
          clientId: yangClient.id,
          moveType: MoveType.OFFICE,
          moveDate: addDays(new Date(), oldRequests.length + 2),
          fromAddress: `서울 중구 삼일대로 ${oldRequests.length + 1}`,
          toAddress: `서울 강남구 선릉로 ${oldRequests.length + 1}`,
          isPending: false,
        },
      });
      oldRequests.push(req);

      // 견적(estimate) 생성, 중복 체크
      const mover = allMovers[oldRequests.length % allMovers.length];
      const exist = await prisma.estimate.findUnique({
        where: {
          requestId_moverId: {
            requestId: req.id,
            moverId: mover.id,
          },
        },
      });
      if (!exist) {
        await prisma.estimate.create({
          data: {
            clientId: yangClient.id,
            moverId: mover.id,
            requestId: req.id,
            moverStatus: EstimateStatus.CONFIRMED,
            isClientConfirmed: true,
            comment: "신속한 이사 도와드리겠습니다.",
            price: 100000 + oldRequests.length * 10000, // 예시 가격 로직
          },
        });
      }
    }

    // (C) yangTrueRequest에 대해 20명 기사 모두 견적(중복 불가)
    for (const mover of allMovers) {
      const exist = await prisma.estimate.findUnique({
        where: {
          requestId_moverId: {
            requestId: yangTrueRequest.id,
            moverId: mover.id,
          },
        },
      });
      if (!exist) {
        await prisma.estimate.create({
          data: {
            clientId: yangClient.id,
            moverId: mover.id,
            requestId: yangTrueRequest.id,
            moverStatus: EstimateStatus.CONFIRMED,
            comment: "견적 확정 시 세부 일정 안내 도와드리겠습니다.",
            price: 180000 + mover.id.length * 1000, // 예시 가격 로직
          },
        });
      }
    }

    // (D) 양성경이 9명 기사를 찜(Favorite, 중복 불가)
    for (let i = 0; i < 9; i++) {
      const mover = allMovers[i];
      const fav = await prisma.favorite.findUnique({
        where: {
          clientId_moverId: { clientId: yangClient.id, moverId: mover.id },
        },
      });
      if (!fav) {
        await prisma.favorite.create({
          data: {
            clientId: yangClient.id,
            moverId: mover.id,
          },
        });
      }
    }

    // (E) 조건에 맞는 견적에만 리뷰 생성 (중복 불가)
    const confirmedEstimates = await prisma.estimate.findMany({
      where: {
        clientId: yangClient.id,
        isClientConfirmed: true,
        request: { moveDate: { lte: new Date() } },
      },
      include: { request: true },
      orderBy: { request: { moveDate: "asc" } },
      take: 10,
    });
    for (let i = 0; i < confirmedEstimates.length; i++) {
      const est = confirmedEstimates[i];
      const reviewExist = await prisma.review.findUnique({
        where: { estimateId: est.id },
      });
      if (!reviewExist) {
        await prisma.review.create({
          data: {
            rating: (i % 5) + 1,
            content: `처음 견적 받아봤는데, 엄청 친절하시고 꼼꼼하세요! 귀찮게 이것저것 물어봤는데 잘 알려주셨습니다. 원룸 이사는 믿고 맡기세요! :)`,
            clientId: yangClient.id,
            moverId: est.moverId,
            estimateId: est.id,
          },
        });
      }
    }
  }

  // 7. 류제천 무버 특수 시드(중복 견적 금지)
  if (ryooMover && yangClient) {
    // (A) 3개 지정견적요청 생성
    for (let i = 0; i < 3; i++) {
      const client = allClients[(i + 10) % allClients.length];
      const targetReq = await prisma.request.create({
        data: {
          clientId: client.id,
          moveType: MoveType.HOME,
          moveDate: addDays(new Date(), 1 + i),
          fromAddress: `부산 강서구 가달1로 ${i + 1}`,
          toAddress: `울산 남구 갈밭로 ${i + 1}`,
          isPending: false,
        },
      });
      await prisma.designatedRequest.upsert({
        where: {
          requestId_moverId: { requestId: targetReq.id, moverId: ryooMover.id },
        },
        update: {},
        create: {
          requestId: targetReq.id,
          moverId: ryooMover.id,
        },
      });
    }

    // (B) CONFIRMED 20, REJECTED 20개 견적(중복 확인)
    const yangClientOldRequests = await prisma.request.findMany({
      where: { clientId: yangClient.id, isPending: false },
    });
    for (let i = 0; i < 20; i++) {
      // CONFIRMED
      const req1 = yangClientOldRequests[i % yangClientOldRequests.length];
      if (req1) {
        const exist1 = await prisma.estimate.findUnique({
          where: {
            requestId_moverId: {
              requestId: req1.id,
              moverId: ryooMover.id,
            },
          },
        });
        if (!exist1) {
          await prisma.estimate.create({
            data: {
              clientId: allClients[(i + 1) % allClients.length].id,
              moverId: ryooMover.id,
              requestId: req1.id,
              moverStatus: EstimateStatus.CONFIRMED,
              comment: `류제천 컨펌 견적 ${i + 1}`,
              isClientConfirmed: true,
              price: 500000 + i * 7000,
            },
          });
        }
      }
      // REJECTED
      const req2 = yangClientOldRequests[(i + 1) % yangClientOldRequests.length];
      if (req2) {
        const exist2 = await prisma.estimate.findUnique({
          where: {
            requestId_moverId: {
              requestId: req2.id,
              moverId: ryooMover.id,
            },
          },
        });
        if (!exist2) {
          await prisma.estimate.create({
            data: {
              clientId: allClients[(i + 2) % allClients.length].id,
              moverId: ryooMover.id,
              requestId: req2.id,
              moverStatus: EstimateStatus.REJECTED,
              comment: `류제천 거절 견적 ${i + 1}`,
              price: 100000 + i * 6000,
            },
          });
        }
      }
    }

    // (C) 리뷰 10개 (isClientConfirmed:true & moveDate<=오늘 견적 중복불가)
    const validEstimates = await prisma.estimate.findMany({
      where: {
        moverId: ryooMover.id,
        isClientConfirmed: true,
        request: { moveDate: { lte: new Date() } },
      },
      orderBy: { request: { moveDate: "desc" } },
      take: 10,
    });
    for (let i = 0; i < validEstimates.length; i++) {
      const est = validEstimates[i];
      const reviewExist = await prisma.review.findUnique({
        where: { estimateId: est.id },
      });
      if (!reviewExist) {
        await prisma.review.create({
          data: {
            rating: (i % 5) + 1,
            content: `류제천 ${i + 1}번째 리뷰 상세 코멘트입니다.`,
            clientId: allClients[(i + 2) % allClients.length].id,
            moverId: ryooMover.id,
            estimateId: est.id,
          },
        });
      }
    }
  }
  console.log("🌱 Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
