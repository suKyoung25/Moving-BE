import request from "supertest";
import app from "../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 전역 테스트 시작 전 데이터베이스 정리
beforeAll(async () => {
  // 모든 관련 데이터를 순서대로 삭제 (외래키 제약조건 고려)
  await prisma.review.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.request.deleteMany();
  await prisma.requestDraft.deleteMany();
  await prisma.client.deleteMany();
  await prisma.mover.deleteMany();

  // 추가로 기존 테스트 데이터가 남아있을 수 있으므로 더 강력한 정리
  await prisma.$executeRaw`TRUNCATE TABLE "Review" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Estimate" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Request" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "RequestDraft" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Client" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Mover" CASCADE`;
});

// 전역 테스트 종료 후 데이터베이스 정리
afterAll(async () => {
  await prisma.review.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.request.deleteMany();
  await prisma.requestDraft.deleteMany();
  await prisma.client.deleteMany();
  await prisma.mover.deleteMany();
  await prisma.$disconnect();
});

describe("POST /reviews - 리뷰 작성 API 테스트", () => {
  let testClient: any;
  let testMover: any;
  let testRequest: any;
  let testEstimate: any;
  let authToken: string;

  // 리뷰 작성 테스트 전후로 데이터베이스 정리
  beforeAll(async () => {
    // 테스트용 클라이언트 생성 (회원가입)
    const createClientResponse = await request(app)
      .post("/auth/signup/client")
      .send({
        email: "reviewtest.client1@test.com",
        name: "김철",
        phone: "0103333333",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testClient = createClientResponse.body.data.user;

    // 테스트용 무버 생성 (회원가입)
    const createMoverResponse = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "reviewtest.mover1@test.com",
        name: "박기",
        nickName: "이사왕",
        phone: "0104444444",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testMover = {
      id: createMoverResponse.body.data.user.userId,
      ...createMoverResponse.body.data.user,
    };

    // 클라이언트 로그인하여 토큰 획득
    const loginResponse = await request(app)
      .post("/auth/signin/client")
      .send({
        email: "reviewtest.client1@test.com",
        password: "password1!",
      })
      .expect(200);

    authToken = loginResponse.body.data.accessToken;

    // 무버 로그인하여 토큰 획득
    const moverLoginResponse = await request(app)
      .post("/auth/signin/mover")
      .send({
        email: "reviewtest.mover1@test.com",
        password: "password1!",
      })
      .expect(200);

    const moverAuthToken = moverLoginResponse.body.data.accessToken;

    // requestDraft를 먼저 생성하여 삭제 오류 방지
    await prisma.requestDraft.create({
      data: {
        clientId: testClient.id,
        currentStep: 0,
      },
    });

    // 테스트용 요청 생성
    const createRequestResponse = await request(app)
      .post("/requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        moveType: "HOME",
        moveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
      })
      .expect(201);

    testRequest = createRequestResponse.body.data;

    // 테스트용 견적 생성
    const createEstimateResponse = await request(app)
      .post("/estimates/create")
      .set("Authorization", `Bearer ${moverAuthToken}`)
      .send({
        price: 500000,
        comment: "정말 만족스러운 서비스였습니다. 친절하고 신속하게 처리해주셔서 감사합니다.",
        clientId: testClient.id,
        requestId: testRequest.id,
        moverId: testMover.id,
      })
      .expect(200);

    testEstimate = createEstimateResponse.body.data;

    // 견적을 클라이언트가 확인한 상태로 만들기
    await prisma.estimate.update({
      where: { id: testEstimate.id },
      data: { isClientConfirmed: true },
    });
  });

  beforeEach(async () => {
    // 각 테스트 전에 리뷰 데이터 정리 (테스트 격리)
    await prisma.review.deleteMany();
  });

  test("올바른 데이터로 리뷰를 작성할 수 있어야 한다", async () => {
    // Setup: 테스트 데이터 준비
    const reviewData = {
      estimateId: testEstimate.id,
      rating: 5,
      content: "정말 만족스러운 서비스였습니다. 친절하고 신속하게 처리해주셔서 감사합니다.",
    };

    // Exercise: API 요청 실행
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send(reviewData)
      .expect(201);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "리뷰 작성 성공");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.rating).toBe(reviewData.rating);
    expect(response.body.data.content).toBe(reviewData.content);

    // Assertion: DB에 실제로 저장되었는지 확인
    const savedReview = await prisma.review.findUnique({
      where: { id: response.body.data.id },
      include: { estimate: { include: { mover: true } } },
    });
    expect(savedReview).toBeTruthy();
    expect(savedReview?.rating).toBe(reviewData.rating);
    expect(savedReview?.content).toBe(reviewData.content);
    expect(savedReview?.clientId).toBe(testClient.id);
    expect(savedReview?.estimate.mover.id).toBe(testMover.id);
  });

  test("존재하지 않는 견적 ID로 리뷰 작성 시 400 에러를 반환해야 한다", async () => {
    // Setup: 잘못된 테스트 데이터 준비
    const invalidData = {
      estimateId: "00000000-0000-0000-0000-000000000000",
      rating: 5,
      content: "테스트 리뷰입니다. 정말 만족스러운 서비스였습니다.",
    };

    // Exercise: API 요청 실행
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send(invalidData)
      .expect(400);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("존재하지 않는 견적");

    // Assertion: DB에 저장되지 않았는지 확인
    const reviews = await prisma.review.findMany({
      where: { estimateId: invalidData.estimateId },
    });
    expect(reviews.length).toBe(0);
  });

  test("이미 리뷰가 작성된 견적에 중복 리뷰 작성 시 422 에러를 반환해야 한다", async () => {
    // Setup: 첫 번째 리뷰 작성
    await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 5,
        content: "첫 번째 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(201);

    // Exercise: 중복 리뷰 작성 시도
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 4,
        content: "두 번째 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(422);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("이미 리뷰가 등록된 견적");

    // Assertion: DB에 하나의 리뷰만 존재하는지 확인
    const reviews = await prisma.review.findMany({
      where: { estimateId: testEstimate.id },
    });
    expect(reviews.length).toBe(1);
  });

  test("인증 토큰 없이 리뷰 작성 시 401 에러를 반환해야 한다", async () => {
    // Exercise: 토큰 없이 API 요청 실행
    const response = await request(app)
      .post("/reviews")
      .send({
        estimateId: testEstimate.id,
        rating: 5,
        content: "테스트 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(401);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("No authorization token was found");
  });

  test("잘못된 평점(0점)으로 리뷰 작성 시 409 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 0,
        content: "테스트 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(409);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
  });

  test("잘못된 평점(6점)으로 리뷰 작성 시 409 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 6,
        content: "테스트 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(409);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
  });

  test("리뷰 내용이 너무 짧으면 409 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 5,
        content: "짧음",
      })
      .expect(409);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
  });
});

describe("GET /reviews/me - 내가 작성한 리뷰 목록 조회 API 테스트", () => {
  let testClient: any;
  let testMover: any;
  let testRequest: any;
  let testEstimate: any;
  let authToken: string;

  beforeAll(async () => {
    // beforeAll은 이제 비워둠 - beforeEach에서 처리
  });

  beforeEach(async () => {
    // 각 테스트 전에 관련 데이터 모두 초기화
    await prisma.review.deleteMany();
    await prisma.estimate.deleteMany();
    await prisma.request.deleteMany();
    await prisma.requestDraft.deleteMany();
    await prisma.mover.deleteMany();
    await prisma.client.deleteMany();

    // 테스트에 필요한 데이터 재생성
    const createClientResponse = await request(app)
      .post("/auth/signup/client")
      .send({
        email: "reviewtest.client2@test.com",
        name: "이영",
        phone: "0101111111",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testClient = createClientResponse.body.data.user;

    const createMoverResponse = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "reviewtest.mover2@test.com",
        name: "최민",
        nickName: "이사전문",
        phone: "0102222222",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testMover = {
      id: createMoverResponse.body.data.user.userId,
      ...createMoverResponse.body.data.user,
    };

    // 클라이언트 로그인하여 토큰 획득
    const loginResponse = await request(app)
      .post("/auth/signin/client")
      .send({
        email: "reviewtest.client2@test.com",
        password: "password1!",
      })
      .expect(200);

    authToken = loginResponse.body.data.accessToken;

    // requestDraft 생성
    await prisma.requestDraft.create({
      data: {
        clientId: testClient.id,
        currentStep: 0,
      },
    });

    // 테스트용 요청 생성
    const createRequestResponse = await request(app)
      .post("/requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        moveType: "HOME",
        moveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
      })
      .expect(201);

    testRequest = createRequestResponse.body.data;

    // 무버 로그인하여 견적 생성
    const moverLoginResponse = await request(app)
      .post("/auth/signin/mover")
      .send({
        email: "reviewtest.mover2@test.com",
        password: "password1!",
      })
      .expect(200);

    const moverAuthToken = moverLoginResponse.body.data.accessToken;

    // 테스트용 견적 생성
    const createEstimateResponse = await request(app)
      .post("/estimates/create")
      .set("Authorization", `Bearer ${moverAuthToken}`)
      .send({
        price: 500000,
        comment: "정말 만족스러운 서비스였습니다. 친절하고 신속하게 처리해주셔서 감사합니다.",
        clientId: testClient.id,
        requestId: testRequest.id,
        moverId: testMover.id,
      })
      .expect(200);

    testEstimate = createEstimateResponse.body.data;

    // 견적을 클라이언트가 확인한 상태로 만들기
    await prisma.estimate.update({
      where: { id: testEstimate.id },
      data: { isClientConfirmed: true },
    });
  });

  test("인증 토큰 없이 내가 작성한 리뷰 목록 조회 시 401 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app).get("/reviews/me").expect(401);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("No authorization token was found");
  });

  test("유효한 토큰으로 내가 작성한 리뷰 목록을 조회할 수 있어야 한다", async () => {
    // Setup: 테스트 리뷰 생성
    await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 5,
        content: "테스트 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(201);

    // Exercise: API 요청 실행
    const response = await request(app)
      .get("/reviews/me")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "내가 작성한 리뷰 목록 조회 성공");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("reviews");
    expect(response.body.data).toHaveProperty("total");
    expect(response.body.data).toHaveProperty("pagination");
    expect(Array.isArray(response.body.data.reviews)).toBe(true);
    expect(response.body.data.reviews.length).toBe(1);
    expect(response.body.data.reviews[0]).toHaveProperty("rating", 5);
    expect(response.body.data.reviews[0]).toHaveProperty(
      "content",
      "테스트 리뷰입니다. 정말 만족스러운 서비스였습니다.",
    );
  });

  test("작성한 리뷰가 없을 때 빈 배열을 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .get("/reviews/me")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "내가 작성한 리뷰 목록 조회 성공");
    expect(response.body.data.reviews).toEqual([]);
    expect(response.body.data.total).toBe(0);
  });
});

describe("GET /reviews/mover/:moverId - 특정 기사님 리뷰 목록 조회 API 테스트", () => {
  let testClient: any;
  let testMover: any;
  let testRequest: any;
  let testEstimate: any;

  beforeAll(async () => {
    // beforeAll은 이제 비워둠 - beforeEach에서 처리
  });

  beforeEach(async () => {
    // 각 테스트 전에 관련 데이터 모두 초기화
    await prisma.review.deleteMany();
    await prisma.estimate.deleteMany();
    await prisma.request.deleteMany();
    await prisma.requestDraft.deleteMany();
    await prisma.mover.deleteMany();
    await prisma.client.deleteMany();

    // 테스트에 필요한 데이터 재생성
    const createClientResponse = await request(app)
      .post("/auth/signup/client")
      .send({
        email: "reviewtest.client3@test.com",
        name: "김민",
        phone: "0104567890",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testClient = createClientResponse.body.data.user;

    const createMoverResponse = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "reviewtest.mover3@test.com",
        name: "박준",
        nickName: "이사마스터",
        phone: "0105678901",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testMover = {
      id: createMoverResponse.body.data.user.userId,
      ...createMoverResponse.body.data.user,
    };

    // 클라이언트 로그인하여 토큰 획득
    const loginResponse = await request(app)
      .post("/auth/signin/client")
      .send({
        email: "reviewtest.client3@test.com",
        password: "password1!",
      })
      .expect(200);

    const authToken = loginResponse.body.data.accessToken;

    // requestDraft 생성
    await prisma.requestDraft.create({
      data: {
        clientId: testClient.id,
        currentStep: 0,
      },
    });

    // 테스트용 요청 생성
    const createRequestResponse = await request(app)
      .post("/requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        moveType: "HOME",
        moveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
      })
      .expect(201);

    testRequest = createRequestResponse.body.data;

    // 무버 로그인하여 견적 생성
    const moverLoginResponse = await request(app)
      .post("/auth/signin/mover")
      .send({
        email: "reviewtest.mover3@test.com",
        password: "password1!",
      })
      .expect(200);

    const moverAuthToken = moverLoginResponse.body.data.accessToken;

    // 테스트용 견적 생성
    const createEstimateResponse = await request(app)
      .post("/estimates/create")
      .set("Authorization", `Bearer ${moverAuthToken}`)
      .send({
        price: 500000,
        comment: "정말 만족스러운 서비스였습니다. 친절하고 신속하게 처리해주셔서 감사합니다.",
        clientId: testClient.id,
        requestId: testRequest.id,
        moverId: testMover.id,
      })
      .expect(200);

    testEstimate = createEstimateResponse.body.data;

    // 견적을 클라이언트가 확인한 상태로 만들기
    await prisma.estimate.update({
      where: { id: testEstimate.id },
      data: { isClientConfirmed: true },
    });
  });

  test("존재하지 않는 기사님 ID로 리뷰 목록 조회 시 200 상태와 빈 배열을 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .get("/reviews/mover/00000000-0000-0000-0000-000000000000")
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "기사님 리뷰 목록 조회 성공");
    expect(response.body.data.reviews).toEqual([]);
    expect(response.body.data.total).toBe(0);
  });

  test("유효한 기사님 ID로 리뷰 목록을 조회할 수 있어야 한다", async () => {
    // Setup: 테스트 리뷰 생성 (API를 통해 생성)
    const loginResponse = await request(app)
      .post("/auth/signin/client")
      .send({
        email: "reviewtest.client3@test.com",
        password: "password1!",
      })
      .expect(200);

    const authToken = loginResponse.body.data.accessToken;

    await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 5,
        content: "테스트 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(201);

    // Exercise: API 요청 실행
    const response = await request(app).get(`/reviews/mover/${testMover.id}`).expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "기사님 리뷰 목록 조회 성공");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("reviews");
    expect(response.body.data).toHaveProperty("total");
    expect(response.body.data).toHaveProperty("pagination");
    expect(Array.isArray(response.body.data.reviews)).toBe(true);
    expect(response.body.data.reviews.length).toBe(1);
    expect(response.body.data.reviews[0]).toHaveProperty("rating", 5);
    expect(response.body.data.reviews[0]).toHaveProperty(
      "content",
      "테스트 리뷰입니다. 정말 만족스러운 서비스였습니다.",
    );
  });

  test("기사님에게 리뷰가 없을 때 빈 배열을 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app).get(`/reviews/mover/${testMover.id}`).expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "기사님 리뷰 목록 조회 성공");
    expect(response.body.data.reviews).toEqual([]);
    expect(response.body.data.total).toBe(0);
  });
});

describe("PATCH /reviews/:reviewId - 리뷰 수정 API 테스트", () => {
  let testClient: any;
  let testMover: any;
  let testRequest: any;
  let testEstimate: any;
  let testReview: any;
  let authToken: string;

  beforeAll(async () => {
    // 테스트용 클라이언트 생성 (회원가입)
    const createClientResponse = await request(app)
      .post("/auth/signup/client")
      .send({
        email: "reviewtest.client4@test.com",
        name: "이수",
        phone: "0106789012",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testClient = createClientResponse.body.data.user;

    // 테스트용 무버 생성 (회원가입)
    const createMoverResponse = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "reviewtest.mover4@test.com",
        name: "최영",
        nickName: "이사프로",
        phone: "0107890123",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testMover = {
      id: createMoverResponse.body.data.user.userId,
      ...createMoverResponse.body.data.user,
    };

    // 클라이언트 로그인하여 토큰 획득
    const loginResponse = await request(app)
      .post("/auth/signin/client")
      .send({
        email: "reviewtest.client4@test.com",
        password: "password1!",
      })
      .expect(200);

    authToken = loginResponse.body.data.accessToken;

    // requestDraft를 먼저 생성하여 삭제 오류 방지
    await prisma.requestDraft.create({
      data: {
        clientId: testClient.id,
        currentStep: 0,
      },
    });

    // 테스트용 요청 생성
    const createRequestResponse = await request(app)
      .post("/requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        moveType: "HOME",
        moveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
      })
      .expect(201);

    testRequest = createRequestResponse.body.data;

    // 무버 로그인하여 견적 생성
    const moverLoginResponse = await request(app)
      .post("/auth/signin/mover")
      .send({
        email: "reviewtest.mover4@test.com",
        password: "password1!",
      })
      .expect(200);

    const moverAuthToken = moverLoginResponse.body.data.accessToken;

    // 테스트용 견적 생성
    const createEstimateResponse = await request(app)
      .post("/estimates/create")
      .set("Authorization", `Bearer ${moverAuthToken}`)
      .send({
        price: 500000,
        comment: "정말 만족스러운 서비스였습니다. 친절하고 신속하게 처리해주셔서 감사합니다.",
        clientId: testClient.id,
        requestId: testRequest.id,
        moverId: testMover.id,
      })
      .expect(200);

    testEstimate = createEstimateResponse.body.data;

    // 견적을 클라이언트가 확인한 상태로 만들기
    await prisma.estimate.update({
      where: { id: testEstimate.id },
      data: { isClientConfirmed: true },
    });
  });

  beforeEach(async () => {
    // 각 테스트 전에 리뷰 데이터 정리
    await prisma.review.deleteMany();

    // 테스트용 리뷰 생성
    const createReviewResponse = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 5,
        content: "원본 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(201);

    testReview = createReviewResponse.body.data;
  });

  test("올바른 데이터로 리뷰를 수정할 수 있어야 한다", async () => {
    // Setup: 수정할 데이터 준비
    const updateData = {
      rating: 4,
      content: "수정된 리뷰입니다. 정말 만족스러운 서비스였습니다.",
    };

    // Exercise: API 요청 실행
    const response = await request(app)
      .patch(`/reviews/${testReview.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "리뷰 수정 성공");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data.rating).toBe(updateData.rating);
    expect(response.body.data.content).toBe(updateData.content);

    // Assertion: DB에 실제로 수정되었는지 확인
    const updatedReview = await prisma.review.findUnique({
      where: { id: testReview.id },
    });
    expect(updatedReview?.rating).toBe(updateData.rating);
    expect(updatedReview?.content).toBe(updateData.content);
  });

  test("존재하지 않는 리뷰 ID로 수정 시 404 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .patch("/reviews/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        rating: 4,
        content: "수정된 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(404);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("리뷰를 찾을 수 없습니다");
  });

  test("인증 토큰 없이 리뷰 수정 시 401 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .patch(`/reviews/${testReview.id}`)
      .send({
        rating: 4,
        content: "수정된 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(401);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("No authorization token was found");
  });

  test("잘못된 평점(0점)으로 리뷰 수정 시 409 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .patch(`/reviews/${testReview.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        rating: 0,
        content: "수정된 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(409);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
  });

  test("잘못된 평점(6점)으로 리뷰 수정 시 409 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .patch(`/reviews/${testReview.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        rating: 6,
        content: "수정된 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(409);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
  });
});

describe("DELETE /reviews/:reviewId - 리뷰 삭제 API 테스트", () => {
  let testClient: any;
  let testMover: any;
  let testRequest: any;
  let testEstimate: any;
  let testReview: any;
  let authToken: string;

  beforeAll(async () => {
    // 테스트용 클라이언트 생성 (회원가입)
    const createClientResponse = await request(app)
      .post("/auth/signup/client")
      .send({
        email: "reviewtest.client5@test.com",
        name: "박현",
        phone: "0108901234",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testClient = createClientResponse.body.data.user;

    // 테스트용 무버 생성 (회원가입)
    const createMoverResponse = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "reviewtest.mover5@test.com",
        name: "김준",
        nickName: "이사스타",
        phone: "0109012345",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testMover = {
      id: createMoverResponse.body.data.user.userId,
      ...createMoverResponse.body.data.user,
    };

    // 클라이언트 로그인하여 토큰 획득
    const loginResponse = await request(app)
      .post("/auth/signin/client")
      .send({
        email: "reviewtest.client5@test.com",
        password: "password1!",
      })
      .expect(200);

    authToken = loginResponse.body.data.accessToken;

    // requestDraft를 먼저 생성하여 삭제 오류 방지
    await prisma.requestDraft.create({
      data: {
        clientId: testClient.id,
        currentStep: 0,
      },
    });

    // 테스트용 요청 생성
    const createRequestResponse = await request(app)
      .post("/requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        moveType: "HOME",
        moveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
      })
      .expect(201);

    testRequest = createRequestResponse.body.data;

    // 무버 로그인하여 견적 생성
    const moverLoginResponse = await request(app)
      .post("/auth/signin/mover")
      .send({
        email: "reviewtest.mover5@test.com",
        password: "password1!",
      })
      .expect(200);

    const moverAuthToken = moverLoginResponse.body.data.accessToken;

    // 테스트용 견적 생성
    const createEstimateResponse = await request(app)
      .post("/estimates/create")
      .set("Authorization", `Bearer ${moverAuthToken}`)
      .send({
        price: 500000,
        comment: "정말 만족스러운 서비스였습니다. 친절하고 신속하게 처리해주셔서 감사합니다.",
        clientId: testClient.id,
        requestId: testRequest.id,
        moverId: testMover.id,
      })
      .expect(200);

    testEstimate = createEstimateResponse.body.data;

    // 견적을 클라이언트가 확인한 상태로 만들기
    await prisma.estimate.update({
      where: { id: testEstimate.id },
      data: { isClientConfirmed: true },
    });
  });

  beforeEach(async () => {
    // 각 테스트 전에 리뷰 데이터 정리
    await prisma.review.deleteMany();

    // 테스트용 리뷰 생성
    const createReviewResponse = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 5,
        content: "삭제할 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(201);

    testReview = createReviewResponse.body.data;
  });

  test("올바른 리뷰 ID로 리뷰를 삭제할 수 있어야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .delete(`/reviews/${testReview.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "리뷰 삭제 성공");

    // Assertion: DB에서 실제로 삭제되었는지 확인
    const deletedReview = await prisma.review.findUnique({
      where: { id: testReview.id },
    });
    expect(deletedReview).toBeNull();
  });

  test("존재하지 않는 리뷰 ID로 삭제 시 401 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .delete("/reviews/00000000-0000-0000-0000-000000000000")
      .expect(401);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("No authorization token was found");
  });

  test("인증 토큰 없이 리뷰 삭제 시 401 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app).delete(`/reviews/${testReview.id}`).expect(401);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("No authorization token was found");
  });
});

describe("GET /reviews/writable - 작성 가능한 리뷰 목록 조회 API 테스트", () => {
  let testClient: any;
  let testMover: any;
  let testRequest: any;
  let testEstimate: any;
  let authToken: string;

  beforeAll(async () => {
    // beforeAll은 이제 비워둠 - beforeEach에서 처리
  });

  beforeEach(async () => {
    // 각 테스트 전에 관련 데이터 모두 초기화
    await prisma.review.deleteMany();
    await prisma.estimate.deleteMany();
    await prisma.request.deleteMany();
    await prisma.requestDraft.deleteMany();
    await prisma.mover.deleteMany();
    await prisma.client.deleteMany();

    // 테스트에 필요한 데이터 재생성
    const createClientResponse = await request(app)
      .post("/auth/signup/client")
      .send({
        email: "reviewtest.client6@test.com",
        name: "김영",
        phone: "0106789012",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testClient = createClientResponse.body.data.user;

    const createMoverResponse = await request(app)
      .post("/auth/signup/mover")
      .send({
        email: "reviewtest.mover6@test.com",
        name: "박준",
        nickName: "이사마스터",
        phone: "0107890123",
        password: "password1!",
        passwordConfirmation: "password1!",
      })
      .expect(201);

    testMover = {
      id: createMoverResponse.body.data.user.userId,
      ...createMoverResponse.body.data.user,
    };

    // 클라이언트 로그인하여 토큰 획득
    const loginResponse = await request(app)
      .post("/auth/signin/client")
      .send({
        email: "reviewtest.client6@test.com",
        password: "password1!",
      })
      .expect(200);

    authToken = loginResponse.body.data.accessToken;

    // requestDraft 생성
    await prisma.requestDraft.create({
      data: {
        clientId: testClient.id,
        currentStep: 0,
      },
    });

    // 테스트용 요청 생성
    const createRequestResponse = await request(app)
      .post("/requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        moveType: "HOME",
        moveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
      })
      .expect(201);

    testRequest = createRequestResponse.body.data;

    // 무버 로그인하여 견적 생성
    const moverLoginResponse = await request(app)
      .post("/auth/signin/mover")
      .send({
        email: "reviewtest.mover6@test.com",
        password: "password1!",
      })
      .expect(200);

    const moverAuthToken = moverLoginResponse.body.data.accessToken;

    // 테스트용 견적 생성
    const createEstimateResponse = await request(app)
      .post("/estimates/create")
      .set("Authorization", `Bearer ${moverAuthToken}`)
      .send({
        price: 500000,
        comment: "정말 만족스러운 서비스였습니다. 친절하고 신속하게 처리해주셔서 감사합니다.",
        clientId: testClient.id,
        requestId: testRequest.id,
        moverId: testMover.id,
      })
      .expect(200);

    testEstimate = createEstimateResponse.body.data;

    // 견적을 클라이언트가 확인한 상태로 만들기
    await prisma.estimate.update({
      where: { id: testEstimate.id },
      data: { isClientConfirmed: true },
    });
  });

  test("인증 토큰 없이 작성 가능한 리뷰 목록 조회 시 401 에러를 반환해야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app).get("/reviews/writable").expect(401);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("No authorization token was found");
  });

  test("유효한 토큰으로 작성 가능한 리뷰 목록을 조회할 수 있어야 한다", async () => {
    // Exercise: API 요청 실행
    const response = await request(app)
      .get("/reviews/writable")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body).toHaveProperty("message", "작성 가능한 리뷰 견적 목록 조회 성공");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("estimates");
    expect(response.body.data).toHaveProperty("total");
    expect(response.body.data).toHaveProperty("pagination");
    expect(Array.isArray(response.body.data.estimates)).toBe(true);
    expect(response.body.data.estimates.length).toBe(1);
    expect(response.body.data.estimates[0]).toHaveProperty("estimateId", testEstimate.id);
  });

  test("이미 리뷰가 작성된 견적은 작성 가능한 목록에 포함되지 않아야 한다", async () => {
    // Setup: 리뷰 작성
    await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        estimateId: testEstimate.id,
        rating: 5,
        content: "테스트 리뷰입니다. 정말 만족스러운 서비스였습니다.",
      })
      .expect(201);

    // Exercise: API 요청 실행
    const response = await request(app)
      .get("/reviews/writable")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Assertion: 결과 검증
    expect(response.body.data.estimates).toEqual([]);
    expect(response.body.data.total).toBe(0);
  });
});
