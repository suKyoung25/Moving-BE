import { PrismaClient, MoveType, Provider, EstimateStatus, Mover, Client } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const regionNames = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

// 전국 주요 도시 좌표 데이터
const locationData = {
  서울: [
    { lat: 37.5665, lng: 126.978, address: "서울 중구 을지로 100" },
    { lat: 37.5172, lng: 127.0473, address: "서울 강남구 테헤란로 152" },
    { lat: 37.5514, lng: 126.9882, address: "서울 종로구 종로 69" },
    { lat: 37.5326, lng: 126.99, address: "서울 용산구 한강대로 405" },
    { lat: 37.4979, lng: 127.0276, address: "서울 서초구 서초대로 396" },
    { lat: 37.5208, lng: 127.123, address: "서울 송파구 올림픽로 300" },
    { lat: 37.548, lng: 126.9142, address: "서울 마포구 월드컵로 240" },
    { lat: 37.5117, lng: 126.9398, address: "서울 영등포구 영등포로 846" },
  ],
  부산: [
    { lat: 35.1796, lng: 129.0756, address: "부산 중구 중앙대로 26" },
    { lat: 35.1595, lng: 129.0595, address: "부산 서구 구덕로 120" },
    { lat: 35.2139, lng: 129.0897, address: "부산 동구 중앙대로 206" },
    { lat: 35.1037, lng: 129.0305, address: "부산 영도구 태종로 423" },
    { lat: 35.1872, lng: 129.2006, address: "부산 해운대구 해운대해변로 264" },
  ],
  대구: [
    { lat: 35.8714, lng: 128.6014, address: "대구 중구 달구벌대로 1995" },
    { lat: 35.8563, lng: 128.5992, address: "대구 북구 칠곡중앙대로 288" },
    { lat: 35.8242, lng: 128.5618, address: "대구 서구 국채보상로 257" },
  ],
  인천: [
    { lat: 37.4563, lng: 126.7052, address: "인천 중구 제물량로 232" },
    { lat: 37.4449, lng: 126.6986, address: "인천 남동구 인주대로 590" },
    { lat: 37.4601, lng: 126.4406, address: "인천 서구 서곶로 307" },
  ],
  광주: [
    { lat: 35.1595, lng: 126.8526, address: "광주 동구 금남로 5가 127" },
    { lat: 35.1379, lng: 126.7937, address: "광주 서구 치평동 1200" },
  ],
  대전: [
    { lat: 36.3504, lng: 127.3845, address: "대전 중구 중앙로 100" },
    { lat: 36.3273, lng: 127.4467, address: "대전 유성구 대학로 291" },
  ],
};

async function main(): Promise<void> {
  console.log("🌱 Starting comprehensive seed process...");

  // 1. 지역 데이터 생성
  console.log("📍 Creating regions...");
  const regions: { id: string; regionName: string }[] = [];
  for (const regionName of regionNames) {
    const region = await prisma.region.upsert({
      where: { regionName },
      update: {},
      create: { regionName },
    });
    regions.push(region);
  }

  // 2. 테스트 계정 생성
  console.log("👤 Creating test accounts...");
  const hashedPassword = await hash("password123!", 10);

  // 테스트 클라이언트들
  const clients: Client[] = await Promise.all([
    prisma.client.upsert({
      where: { email: "test.client@example.com" },
      update: {},
      create: {
        email: "test.client@example.com",
        name: "김고객",
        phone: "010-1111-1111",
        hashedPassword,
        serviceType: [MoveType.HOME, MoveType.SMALL],
        isProfileCompleted: true,
        livingArea: {
          connect: regions.filter((r) => ["서울", "경기"].includes(r.regionName)),
        },
      },
    }),
    prisma.client.upsert({
      where: { email: "kim.client@example.com" },
      update: {},
      create: {
        email: "kim.client@example.com",
        name: "박고객",
        phone: "010-2222-2222",
        hashedPassword,
        serviceType: [MoveType.OFFICE],
        isProfileCompleted: true,
        livingArea: {
          connect: regions.filter((r) => ["부산", "경남"].includes(r.regionName)),
        },
      },
    }),
    prisma.client.upsert({
      where: { email: "lee.client@example.com" },
      update: {},
      create: {
        email: "lee.client@example.com",
        name: "이고객",
        phone: "010-3333-3333",
        hashedPassword,
        serviceType: [MoveType.HOME, MoveType.OFFICE, MoveType.SMALL],
        isProfileCompleted: true,
        livingArea: {
          connect: regions.filter((r) => ["대구", "경북"].includes(r.regionName)),
        },
      },
    }),
  ]);

  // 3. 테스트 기사들 생성 (실제 좌표 포함)
  console.log("🚛 Creating test movers with real locations...");
  const movers: Mover[] = [];

  // 각 지역별 기사 생성
  for (const [region, coordinates] of Object.entries(locationData)) {
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i];
      const mover = await prisma.mover.upsert({
        where: { email: `${region.toLowerCase()}.mover${i + 1}@example.com` },
        update: {},
        create: {
          email: `${region.toLowerCase()}.mover${i + 1}@example.com`,
          name: `${region}기사${i + 1}`,
          nickName: `${region}기사${i + 1}`,
          phone: `010-${
            region === "서울"
              ? "4000"
              : region === "부산"
              ? "5000"
              : region === "대구"
              ? "6000"
              : region === "인천"
              ? "7000"
              : region === "광주"
              ? "8000"
              : "9000"
          }-${(i + 1).toString().padStart(4, "0")}`,
          hashedPassword,
          career: Math.floor(Math.random() * 15) + 1,
          introduction: `안녕하세요! ${region} 지역 ${
            Math.floor(Math.random() * 15) + 1
          }년 경력의 이사 전문가입니다. 안전하고 신속한 이사 서비스를 제공합니다.`,
          description: `${region} 전 지역 이사 가능하며, 고객 만족을 위해 최선을 다하겠습니다. 포장부터 운반까지 책임지고 진행합니다.`,
          serviceType:
            i % 3 === 0
              ? [MoveType.HOME, MoveType.SMALL, MoveType.OFFICE]
              : i % 3 === 1
              ? [MoveType.HOME, MoveType.SMALL]
              : [MoveType.OFFICE, MoveType.HOME],
          latitude: coord.lat,
          longitude: coord.lng,
          businessAddress: coord.address,
          averageReviewRating: 3.5 + Math.random() * 1.5,
          reviewCount: Math.floor(Math.random() * 100) + 5,
          estimateCount: Math.floor(Math.random() * 200) + 10,
          favoriteCount: Math.floor(Math.random() * 50),
          isProfileCompleted: true,
          serviceArea: {
            connect: regions.filter((r) => {
              // 주변 지역도 서비스 가능하도록 설정
              if (region === "서울") return ["서울", "경기", "인천"].includes(r.regionName);
              if (region === "부산") return ["부산", "울산", "경남"].includes(r.regionName);
              if (region === "대구") return ["대구", "경북", "경남"].includes(r.regionName);
              if (region === "인천") return ["인천", "서울", "경기"].includes(r.regionName);
              if (region === "광주") return ["광주", "전남", "전북"].includes(r.regionName);
              if (region === "대전") return ["대전", "충남", "충북"].includes(r.regionName);
              return [r.regionName].includes(region);
            }),
          },
        },
      });
      movers.push(mover);
    }
  }

  // 4. 이사 요청 데이터 생성
  console.log("📋 Creating moving requests...");
  const requests = await Promise.all([
    prisma.request.create({
      data: {
        clientId: clients[0].id,
        moveType: MoveType.HOME,
        moveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        fromAddress: "서울시 강남구 역삼동 123-45 현대빌딩 5층",
        toAddress: "서울시 서초구 서초동 678-90 서초타워 12층",
        isPending: true,
      },
    }),
    prisma.request.create({
      data: {
        clientId: clients[1].id,
        moveType: MoveType.OFFICE,
        moveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        fromAddress: "부산시 해운대구 우동 111-22 해운대센텀빌딩",
        toAddress: "부산시 중구 중앙동 333-44 부산상공회의소",
        isPending: true,
      },
    }),
    prisma.request.create({
      data: {
        clientId: clients[2].id,
        moveType: MoveType.SMALL,
        moveDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        fromAddress: "대구시 중구 동성로 200 원룸",
        toAddress: "대구시 북구 칠곡중앙대로 투룸 아파트",
        isPending: true,
      },
    }),
    prisma.request.create({
      data: {
        clientId: clients[0].id,
        moveType: MoveType.HOME,
        moveDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 완료된 이사
        fromAddress: "서울시 마포구 홍대입구 아파트",
        toAddress: "서울시 강남구 역삼동 오피스텔",
        isPending: false,
      },
    }),
  ]);

  // 5. 견적 데이터 생성
  console.log("💰 Creating estimates...");
  const estimates = await Promise.all([
    // 첫 번째 요청에 대한 견적들
    prisma.estimate.create({
      data: {
        clientId: clients[0].id,
        moverId: movers[0].id,
        requestId: requests[0].id,
        price: 280000,
        moverStatus: EstimateStatus.CONFIRMED,
        isClientConfirmed: false,
        comment: "안전하고 빠른 이사 서비스를 제공해드리겠습니다. 포장재 무료 제공!",
      },
    }),
    prisma.estimate.create({
      data: {
        clientId: clients[0].id,
        moverId: movers[1].id,
        requestId: requests[0].id,
        price: 320000,
        moverStatus: EstimateStatus.CONFIRMED,
        isClientConfirmed: false,
        comment: "10년 경력의 전문 기사가 책임지고 이사해드립니다.",
      },
    }),
    prisma.estimate.create({
      data: {
        clientId: clients[0].id,
        moverId: movers[2].id,
        requestId: requests[0].id,
        price: 250000,
        moverStatus: EstimateStatus.CONFIRMED,
        isClientConfirmed: true, // 확정된 견적
        comment: "합리적인 가격으로 최고의 서비스를 제공하겠습니다!",
      },
    }),
    // 두 번째 요청에 대한 견적들
    prisma.estimate.create({
      data: {
        clientId: clients[1].id,
        moverId: movers[8].id, // 부산 기사
        requestId: requests[1].id,
        price: 450000,
        moverStatus: EstimateStatus.CONFIRMED,
        isClientConfirmed: false,
        comment: "사무실 이사 전문입니다. 서류 포장도 꼼꼼히 해드려요.",
      },
    }),
    // 완료된 이사에 대한 견적
    prisma.estimate.create({
      data: {
        clientId: clients[0].id,
        moverId: movers[3].id,
        requestId: requests[3].id,
        price: 200000,
        moverStatus: EstimateStatus.CONFIRMED,
        isClientConfirmed: true,
        comment: "완료된 이사입니다. 만족스러운 서비스였습니다.",
      },
    }),
  ]);

  // 6. 리뷰 데이터 생성
  console.log("⭐ Creating reviews...");
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        content:
          "정말 친절하고 꼼꼼하게 이사해주셨어요! 물건 하나하나 소중하게 다뤄주시고, 새 집에서도 정리까지 도와주셨습니다. 다음에도 꼭 부탁드리고 싶어요!",
        images: [],
        clientId: clients[0].id,
        moverId: movers[3].id,
        estimateId: estimates[4].id,
      },
    }),
  ]);

  // 일부 기사들에게 추가 리뷰 데이터
  for (let i = 0; i < 5; i++) {
    const randomMover = movers[Math.floor(Math.random() * movers.length)];
    const randomClient = clients[Math.floor(Math.random() * clients.length)];

    // 가상의 견적 생성 (리뷰용)
    const tempRequest = await prisma.request.create({
      data: {
        clientId: randomClient.id,
        moveType: [MoveType.HOME, MoveType.SMALL, MoveType.OFFICE][Math.floor(Math.random() * 3)],
        moveDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
        fromAddress: "완료된 이사 출발지",
        toAddress: "완료된 이사 도착지",
        isPending: false,
      },
    });

    const tempEstimate = await prisma.estimate.create({
      data: {
        clientId: randomClient.id,
        moverId: randomMover.id,
        requestId: tempRequest.id,
        price: Math.floor(Math.random() * 300000) + 150000,
        moverStatus: EstimateStatus.CONFIRMED,
        isClientConfirmed: true,
        comment: "완료된 이사입니다.",
      },
    });

    await prisma.review.create({
      data: {
        rating: Math.floor(Math.random() * 2) + 4, // 4-5점
        content: [
          "시간 약속도 잘 지키시고, 이사도 깔끔하게 해주셨어요!",
          "전문적이고 친절한 서비스였습니다. 추천해요!",
          "물건 하나도 안 부서지고 안전하게 이사 완료했습니다.",
          "가격 대비 만족스러운 이사 서비스였어요.",
          "다음에도 이 기사님께 부탁드리고 싶습니다!",
        ][i],
        clientId: randomClient.id,
        moverId: randomMover.id,
        estimateId: tempEstimate.id,
      },
    });
  }

  // 7. 즐겨찾기 데이터 생성
  console.log("❤️ Creating favorites...");
  await Promise.all([
    prisma.favorite.create({
      data: {
        clientId: clients[0].id,
        moverId: movers[0].id,
      },
    }),
    prisma.favorite.create({
      data: {
        clientId: clients[0].id,
        moverId: movers[3].id,
      },
    }),
    prisma.favorite.create({
      data: {
        clientId: clients[1].id,
        moverId: movers[8].id,
      },
    }),
  ]);

  // 8. 커뮤니티 게시글 생성
  console.log("💬 Creating community posts...");
  await Promise.all([
    prisma.community.create({
      data: {
        title: "이사 준비 완벽 체크리스트 공유해요!",
        content: `이사할 때 꼭 알아야 할 체크리스트를 정리해서 공유합니다.

**이사 2주 전**
- 이사업체 견적 비교 및 선정
- 전기, 가스, 인터넷 이전 신청
- 주민등록 이전 준비

**이사 1주 전**
- 포장재 준비 (박스, 뽁뽁이, 테이프 등)
- 냉장고, 세탁기 물빼기
- 귀중품 따로 보관

**이사 당일**
- 기사님과 함께 물품 점검
- 새 집 청소 상태 확인
- 입주 후 시설 점검

많은 도움이 되었으면 좋겠습니다!`,
        clientId: clients[0].id,
      },
    }),
    prisma.community.create({
      data: {
        title: "안전한 이사를 위한 주의사항 (기사님 관점)",
        content: `10년 넘게 이사 일을 하면서 느낀 안전 수칙들을 공유드립니다.

**고객분들께 당부드리고 싶은 점:**

1. **포장은 미리미리**
   - 당일 포장하면 시간이 많이 걸려요
   - 특히 그릇류는 신문지로 꼼꼼히 감싸주세요

2. **무거운 물건 주의**
   - 책, 옷 등은 작은 박스에 나눠 담아주세요
   - 너무 무거우면 박스가 찢어질 수 있어요

3. **귀중품은 직접 운반**
   - 현금, 보석, 중요서류는 따로 챙겨주세요
   - 만약의 사고에 대비해주세요

4. **접근로 확인**
   - 엘리베이터 사용 가능 시간 확인
   - 주차 공간 미리 확보

안전한 이사를 위해 서로 협조해요!`,
        moverId: movers[0].id,
      },
    }),
    prisma.community.create({
      data: {
        title: "소형이사 vs 일반이사 차이점이 궁금해요",
        content: `다음 달에 이사 예정인데 소형이사와 일반이사의 차이가 궁금합니다.

원룸에서 투룸으로 이사하는데 어떤 걸 선택해야 할까요?
짐은 그렇게 많지 않은 편이에요.

경험 있으신 분들 조언 부탁드려요!`,
        clientId: clients[2].id,
      },
    }),
  ]);

  // 9. 커뮤니티 댓글 생성
  console.log("💭 Creating community replies...");
  const communityPosts = await prisma.community.findMany();

  await Promise.all([
    prisma.reply.create({
      data: {
        content: "정말 유용한 정보네요! 특히 포장재 준비 부분이 도움됐어요. 감사합니다!",
        communityId: communityPosts[0].id,
        clientId: clients[1].id,
      },
    }),
    prisma.reply.create({
      data: {
        content: "기사님 관점에서 알려주시니 더 와닿네요. 다음 이사 때 꼭 참고하겠습니다!",
        communityId: communityPosts[1].id,
        clientId: clients[2].id,
      },
    }),
    prisma.reply.create({
      data: {
        content:
          "원룸에서 투룸이면 소형이사로도 충분할 것 같아요. 견적 여러 곳 받아보시고 결정하세요!",
        communityId: communityPosts[2].id,
        moverId: movers[5].id,
      },
    }),
  ]);

  // 10. 알림 데이터 생성 (샘플)
  console.log("🔔 Creating notifications...");
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: clients[0].id,
        content: "새로운 견적이 도착했습니다.",
        type: "NEW_ESTIMATE",
        targetId: estimates[0].id,
        targetUrl: `/estimate/${estimates[0].id}`,
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: clients[0].id,
        content: "견적이 확정되었습니다.",
        type: "ESTIMATE_CONFIRMED",
        targetId: estimates[2].id,
        targetUrl: `/estimate/${estimates[2].id}`,
        isRead: true,
      },
    }),
  ]);

  console.log("✅ Comprehensive seed completed successfully!");
  console.log(`📊 Created data summary:`);
  console.log(`   📍 ${regions.length} regions`);
  console.log(`   👤 ${clients.length} clients`);
  console.log(`   🚛 ${movers.length} movers`);
  console.log(`   📋 ${requests.length} requests`);
  console.log(`   💰 ${estimates.length} estimates`);
  console.log(`   ⭐ Multiple reviews`);
  console.log(`   ❤️ 3 favorites`);
  console.log(`   💬 3 community posts with replies`);
  console.log(`   🔔 2 notifications`);
  console.log(`🗺️ Map markers should now be visible across major cities!`);
  console.log(`🔑 Test accounts:`);
  console.log(`   Client: test.client@example.com / password123!`);
  console.log(`   Mover: seoul.mover1@example.com / password123!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
