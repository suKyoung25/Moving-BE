import request from "supertest";
import app from "../app";
import prisma from "../configs/prisma.config";

// 전역 테스트 종료 후 데이터베이스 정리
afterAll(async () => {
  await prisma.favorite.deleteMany();
  await prisma.client.deleteMany({ where: { email: "favoritetest.client@test.com" } });
  await prisma.mover.deleteMany({ where: { email: "favoritetest.mover1@test.com" } });
  await prisma.mover.deleteMany({ where: { email: "favoritetest.mover2@test.com" } });
  await prisma.mover.deleteMany({ where: { email: "favoritetest.mover3@test.com" } });
  await prisma.mover.deleteMany({ where: { email: "favoritetest.mover4@test.com" } });
  await prisma.mover.deleteMany({ where: { email: "favoritetest.mover5@test.com" } });
});

describe("GET /favorites/me - 내가 찜한 기사님 목록 조회 API 테스트", () => {
  let testClient: any;
  let testMover1: any;
  let testMover2: any;
  let testMover3: any;
  let authToken: string;

  beforeAll(async () => {
    // 테스트용 클라이언트 생성 (회원가입)
    const createClientResponse = await request(app)
      .post("/auth/signup/client")
      .send({
        email: "favoritetest.client@test.com",
        name: "김고객",
        phone: "0101234567",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testClient = createClientResponse.body.data.user;

    // 테스트용 무버들 생성 (회원가입)
    const createMover1Response = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "favoritetest.mover1@test.com",
        name: "박기사",
        nickName: "이사왕1",
        phone: "0108765432",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testMover1 = {
      id: createMover1Response.body.data.user.userId,
      ...createMover1Response.body.data.user,
    };

    const createMover2Response = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "favoritetest.mover2@test.com",
        name: "최기사",
        nickName: "이사전문2",
        phone: "0109876543",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testMover2 = {
      id: createMover2Response.body.data.user.userId,
      ...createMover2Response.body.data.user,
    };

    const createMover3Response = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "favoritetest.mover3@test.com",
        name: "이기사",
        nickName: "이사마스터3",
        phone: "01056789012",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testMover3 = {
      id: createMover3Response.body.data.user.userId,
      ...createMover3Response.body.data.user,
    };
  });

  beforeEach(async () => {
    // 각 테스트 전에 찜 데이터만 정리 (테스트 격리)
    await prisma.favorite.deleteMany();

    // 클라이언트가 유효한지 확인하고, 필요시 재생성
    const existingClient = await prisma.client.findUnique({
      where: { id: testClient.id },
    });

    if (!existingClient) {
      // 클라이언트가 삭제되었다면 재생성
      const createClientResponse = await request(app)
        .post("/auth/signup/client")
        .send({
          email: "favoritetest.client@test.com",
          name: "김고객",
          phone: "0101234567",
          password: "password1!",
          passwordConfirmation: "password1!",
        })
        .expect(201);

      testClient = createClientResponse.body.data.user;
    }

    // 클라이언트 로그인하여 토큰 획득
    const loginResponse = await request(app)
      .post("/auth/signin/client")
      .send({
        email: "favoritetest.client@test.com",
        password: "password1!",
      })
      .expect(200);

    authToken = loginResponse.body.data.accessToken;

    // 찜 데이터 생성
    await prisma.favorite.create({
      data: {
        clientId: testClient.id,
        moverId: testMover1.id,
      },
    });

    await prisma.favorite.create({
      data: {
        clientId: testClient.id,
        moverId: testMover2.id,
      },
    });
  });

  afterEach(async () => {
    // 각 테스트 후 찜 데이터 정리
    await prisma.favorite.deleteMany();
  });

  it("유효한 토큰으로 찜한 기사님 목록을 조회할 수 있어야 한다", async () => {
    // Action: 찜한 기사님 목록 조회
    const response = await request(app)
      .get("/favorites/me")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "찜한 기사님 목록 조회 성공");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("movers");
    expect(Array.isArray(response.body.data.movers)).toBe(true);
    expect(response.body.data.movers).toHaveLength(2);
    expect(response.body.data).toHaveProperty("total", 2);
    expect(response.body.data).toHaveProperty("pagination");
    expect(response.body.data.pagination).toHaveProperty("page", 1);
    expect(response.body.data.pagination).toHaveProperty("limit", 6);
    expect(response.body.data.pagination).toHaveProperty("totalPages", 1);

    // 찜한 기사님들의 정보 확인
    const moverIds = response.body.data.movers.map((m: any) => m.id);
    expect(moverIds).toContain(testMover1.id);
    expect(moverIds).toContain(testMover2.id);

    // isLiked 필드 확인
    response.body.data.movers.forEach((mover: any) => {
      expect(mover).toHaveProperty("isLiked", true);
    });
  });

  it("인증 토큰 없이 찜한 기사님 목록 조회 시 401 에러를 반환해야 한다", async () => {
    // Action: 토큰 없이 찜한 기사님 목록 조회
    const response = await request(app).get("/favorites/me").expect(401);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("No authorization token was found");
  });

  it("찜한 기사님이 없을 때 빈 배열을 반환해야 한다", async () => {
    // Setup: 기존 찜 데이터 삭제
    await prisma.favorite.deleteMany();

    // Action: 찜한 기사님 목록 조회
    const response = await request(app)
      .get("/favorites/me")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "찜한 기사님 목록 조회 성공");
    expect(response.body.data.movers).toHaveLength(0);
    expect(response.body.data.total).toBe(0);
    expect(response.body.data.pagination.totalPages).toBe(0);
  });

  it("페이지네이션 파라미터를 사용하여 찜한 기사님 목록을 조회할 수 있어야 한다", async () => {
    // Setup: 추가 무버 생성 및 찜 추가
    const createMover4Response = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "favoritetest.mover4@test.com",
        name: "한기사",
        nickName: "이사프로4",
        phone: "01078901234",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    const testMover4 = {
      id: createMover4Response.body.data.user.userId,
      ...createMover4Response.body.data.user,
    };

    await prisma.favorite.create({
      data: {
        clientId: testClient.id,
        moverId: testMover4.id,
      },
    });

    // Action: 페이지네이션 파라미터로 조회 (페이지 1, 제한 2)
    const response = await request(app)
      .get("/favorites/me?page=1&limit=2")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body.data.movers).toHaveLength(2);
    expect(response.body.data.pagination.page).toBe(1);
    expect(response.body.data.pagination.limit).toBe(2);
    expect(response.body.data.total).toBe(3);
    expect(response.body.data.pagination.totalPages).toBe(2);
  });

  it("잘못된 페이지네이션 파라미터를 사용할 때 기본값으로 조회해야 한다", async () => {
    // Action: 잘못된 페이지네이션 파라미터로 조회
    const response = await request(app)
      .get("/favorites/me?page=invalid&limit=invalid")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증 (기본값: page=1, limit=6)
    expect(response.body.data.pagination.page).toBe(1);
    expect(response.body.data.pagination.limit).toBe(6);
    expect(response.body.data.movers).toHaveLength(2);
  });

  it("페이지 2를 요청했을 때 올바른 결과를 반환해야 한다", async () => {
    // Setup: 추가 무버들 생성 및 찜 추가 (총 3개)
    for (let i = 4; i <= 4; i++) {
      const createMoverResponse = await request(app)
        .post("/auth/signup/mover")
        .send({
          email: "favoritetest.mover5@test.com",
          name: `기사${i}`,
          nickName: `이사5`,
          phone: `0101334567${i}`,
          password: "password1!",
          passwordConfirmation: "password1!",
        })
        .expect(201);

      const testMover = {
        id: createMoverResponse.body.data.user.userId,
        ...createMoverResponse.body.data.user,
      };

      await prisma.favorite.create({
        data: {
          clientId: testClient.id,
          moverId: testMover.id,
        },
      });
    }

    // Action: 페이지 2 조회 (제한 3)
    const response = await request(app)
      .get("/favorites/me?page=2&limit=3")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body.data.pagination.page).toBe(2);
    expect(response.body.data.pagination.limit).toBe(3);
    expect(response.body.data.total).toBe(3);
    expect(response.body.data.pagination.totalPages).toBe(1); // 총 3개, 제한 3개이므로 1페이지
    expect(response.body.data.movers).toHaveLength(0); // 페이지 2에는 0개여야 함
  });
});
