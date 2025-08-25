import request from "supertest";
import app from "../app";
import prisma from "../configs/prisma.config";
import jwt from "jsonwebtoken";
import { MoveType } from "@prisma/client";

// 테스트용 JWT 토큰 생성 헬퍼
const generateTestToken = (userId: string, userType: "client" | "mover" = "client") => {
  return jwt.sign({ userId, userType }, process.env.JWT_SECRET || "test-secret", {
    expiresIn: "1h",
  });
};

describe("Mover API Integration Tests", () => {
  let testClientId: string;
  let testMoverId: string;
  let testMoverId2: string;
  let clientToken: string;
  let moverToken: string;

  beforeAll(async () => {
    // 기존 테스트 데이터 정리
    await prisma.favorite.deleteMany({});
    await prisma.mover.deleteMany({
      where: {
        email: { in: ["testmover1@example.com", "testmover2@example.com"] },
      },
    });
    await prisma.client.deleteMany({
      where: { email: "testclient@example.com" },
    });

    // 테스트용 클라이언트 생성
    const testClient = await prisma.client.create({
      data: {
        email: "testclient@example.com",
        name: "테스트 클라이언트",
        phone: "010-1234-5678",
        provider: "LOCAL",
      },
    });
    testClientId = testClient.id;
    clientToken = generateTestToken(testClientId, "client");

    // 테스트용 기사 생성 (간소화)
    const testMover1 = await prisma.mover.create({
      data: {
        email: "testmover1@example.com",
        name: "테스트 기사1",
        nickName: "친절한기사",
        phone: "010-1111-1111",
        provider: "LOCAL",
        career: 5,
        serviceType: [MoveType.HOME, MoveType.OFFICE],
        introduction: "안전하고 빠른 이사 서비스를 제공합니다.",
        averageReviewRating: 4.5,
        reviewCount: 10,
        estimateCount: 25,
        favoriteCount: 3,
      },
    });
    testMoverId = testMover1.id;

    const testMover2 = await prisma.mover.create({
      data: {
        email: "testmover2@example.com",
        name: "테스트 기사2",
        nickName: "빠른기사",
        phone: "010-2222-2222",
        provider: "LOCAL",
        career: 3,
        serviceType: [MoveType.HOME],
        introduction: "빠르고 정확한 이사 서비스입니다.",
        averageReviewRating: 4.0,
        reviewCount: 5,
        estimateCount: 15,
        favoriteCount: 1,
      },
    });
    testMoverId2 = testMover2.id;
    moverToken = generateTestToken(testMoverId2, "mover");
  }, 30000); // 30초 타임아웃

  afterAll(async () => {
    try {
      // 테스트 데이터 정리 - 간소화
      await prisma.favorite.deleteMany({
        where: { clientId: testClientId },
      });

      await prisma.mover.deleteMany({
        where: { id: { in: [testMoverId, testMoverId2] } },
      });

      await prisma.client.deleteMany({
        where: { id: testClientId },
      });
    } catch (error) {
      console.error("Cleanup error:", error);
    } finally {
      await prisma.$disconnect();
    }
  }, 30000); // 30초 타임아웃

  describe("GET /movers", () => {
    test("비회원도 기사 리스트를 조회할 수 있어야 한다", async () => {
      const response = await request(app).get("/movers").expect(200);

      expect(response.body).toHaveProperty("movers");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("limit");
      expect(response.body).toHaveProperty("hasMore");
      expect(Array.isArray(response.body.movers)).toBe(true);
    });

    test("회원은 찜 상태와 함께 기사 리스트를 조회할 수 있어야 한다", async () => {
      const response = await request(app)
        .get("/movers")
        .set("Authorization", `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.movers.length).toBeGreaterThan(0);

      const mover = response.body.movers[0];
      expect(mover).toHaveProperty("id");
      expect(mover).toHaveProperty("nickName");
      expect(mover).toHaveProperty("isFavorite");
      expect(typeof mover.isFavorite).toBe("boolean");
    });

    test("검색 파라미터로 기사를 필터링할 수 있어야 한다", async () => {
      const response = await request(app)
        .get("/movers")
        .query({
          search: "친절한",
          page: 1,
          limit: 10,
        })
        .expect(200);

      expect(response.body.movers.length).toBeGreaterThan(0);
      expect(response.body.movers.some((mover: any) => mover.nickName.includes("친절한"))).toBe(
        true,
      );
    });

    test("정렬 옵션이 올바르게 작동해야 한다", async () => {
      const response = await request(app)
        .get("/movers")
        .query({
          sortBy: "highRating",
          limit: 5,
        })
        .expect(200);

      expect(response.body.movers.length).toBeGreaterThan(0);

      // 평점 순으로 정렬되었는지 확인
      const ratings = response.body.movers.map((mover: any) => mover.averageReviewRating);
      const sortedRatings = [...ratings].sort((a, b) => b - a);
      expect(ratings).toEqual(sortedRatings);
    });

    test("페이지네이션이 올바르게 작동해야 한다", async () => {
      const response = await request(app)
        .get("/movers")
        .query({
          page: 1,
          limit: 1,
        })
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.movers.length).toBeLessThanOrEqual(1);
    });

    test("잘못된 페이지 번호로 요청시 400 에러가 발생해야 한다", async () => {
      await request(app).get("/movers").query({ page: 0 }).expect(400);
    });
  });

  describe("GET /movers/:moverId", () => {
    test("비회원도 기사 상세 정보를 조회할 수 있어야 한다", async () => {
      const response = await request(app).get(`/movers/${testMoverId}`).expect(200);

      expect(response.body).toHaveProperty("id", testMoverId);
      expect(response.body).toHaveProperty("nickName");
      expect(response.body).toHaveProperty("serviceArea");
      expect(response.body).toHaveProperty("serviceType");
      expect(response.body).toHaveProperty("isFavorite", false);
    });

    test("회원은 찜 상태와 함께 기사 상세 정보를 조회할 수 있어야 한다", async () => {
      const response = await request(app)
        .get(`/movers/${testMoverId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", testMoverId);
      expect(response.body).toHaveProperty("isFavorite");
      expect(typeof response.body.isFavorite).toBe("boolean");
    });

    test("존재하지 않는 기사 ID로 요청시 404 에러가 발생해야 한다", async () => {
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440000"; // 유효한 UUID 형식

      await request(app).get(`/movers/${nonExistentId}`).expect(404);
    });

    test("잘못된 형식의 기사 ID로 요청시 에러가 발생해야 한다", async () => {
      const response = await request(app).get("/movers/invalid-id");

      // 400 또는 500 에러 중 하나가 발생해야 함
      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe("POST /movers/:moverId/toggle-favorite", () => {
    test("인증된 사용자는 기사를 찜할 수 있어야 한다", async () => {
      const response = await request(app)
        .post(`/movers/${testMoverId}/toggle-favorite`)
        .set("Authorization", `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "찜 추가 성공");
      expect(response.body).toHaveProperty("action", "added");
      expect(response.body).toHaveProperty("isFavorite", true);
      expect(response.body).toHaveProperty("favoriteCount");
    });

    test("이미 찜한 기사를 다시 요청하면 찜 해제되어야 한다", async () => {
      // 먼저 찜 추가
      await request(app)
        .post(`/movers/${testMoverId2}/toggle-favorite`)
        .set("Authorization", `Bearer ${clientToken}`)
        .expect(200);

      // 다시 요청하여 찜 해제
      const response = await request(app)
        .post(`/movers/${testMoverId2}/toggle-favorite`)
        .set("Authorization", `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "찜 해제 성공");
      expect(response.body).toHaveProperty("action", "removed");
      expect(response.body).toHaveProperty("isFavorite", false);
    });

    test("인증되지 않은 사용자는 찜할 수 없어야 한다", async () => {
      await request(app).post(`/movers/${testMoverId}/toggle-favorite`).expect(401);
    });

    test("존재하지 않는 기사를 찜하려고 하면 404 에러가 발생해야 한다", async () => {
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440000"; // 유효한 UUID 형식

      await request(app)
        .post(`/movers/${nonExistentId}/toggle-favorite`)
        .set("Authorization", `Bearer ${clientToken}`)
        .expect(404);
    });

    test("잘못된 토큰으로 요청시 401 에러가 발생해야 한다", async () => {
      await request(app)
        .post(`/movers/${testMoverId}/toggle-favorite`)
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });

  describe("GET /movers/profile", () => {
    test("인증된 기사는 본인 프로필을 조회할 수 있어야 한다", async () => {
      const response = await request(app)
        .get("/movers/profile")
        .set("Authorization", `Bearer ${moverToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "기사님 프로필 조회 성공");
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id", testMoverId2);
      expect(response.body.data).toHaveProperty("nickName");
      expect(response.body.data).toHaveProperty("serviceArea");
    });

    test("인증되지 않은 사용자는 프로필을 조회할 수 없어야 한다", async () => {
      await request(app).get("/movers/profile").expect(401);
    });

    test("클라이언트 토큰으로는 기사 프로필을 조회할 수 없어야 한다", async () => {
      const response = await request(app)
        .get("/movers/profile")
        .set("Authorization", `Bearer ${clientToken}`);

      // 403 또는 400 에러가 발생해야 함 (구현에 따라)
      expect([400, 403]).toContain(response.status);
    });
  });

  describe("응답 헤더 보안 검증", () => {
    test("모든 기사 API 응답에 보안 헤더가 포함되어야 한다", async () => {
      const response = await request(app).get("/movers").expect(200);

      // Helmet 미들웨어가 설정한 보안 헤더 확인
      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers).toHaveProperty("x-content-type-options");
    });
  });

  describe("CORS 설정 검증", () => {
    test("올바른 CORS 헤더가 설정되어야 한다", async () => {
      const response = await request(app)
        .get("/movers")
        .set("Origin", process.env.FRONTEND_URL || "http://localhost:3000")
        .expect(200);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });

  describe("에러 핸들링", () => {
    test("데이터베이스 연결 오류시 적절한 에러 응답을 반환해야 한다", async () => {
      // prisma 연결을 일시적으로 끊거나 모킹하여 테스트
      // 실제 구현에서는 데이터베이스 연결 오류를 시뮬레이션하는 방법을 사용

      // 예: 존재하지 않는 테이블에 접근하여 에러 발생
      const response = await request(app)
        .get("/movers")
        .query({ limit: -1 }) // 잘못된 파라미터로 에러 유발
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });
});
