import prisma from "../configs/prisma.config";
import reviewRepository from "./review.repository";
import { MoveType, Prisma, Review } from "@prisma/client";

// Prisma 클라이언트 모킹
jest.mock("../configs/prisma.config", () => ({
  review: {
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  mover: {
    update: jest.fn(),
  },
}));

// 타입스크립트 캐스팅 (mockResolvedValue 사용 위해 각 메서드는 jest.Mock로 캐스팅 필요)
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

// 트랜잭션 클라이언트 모킹용 객체
const mockTxClient = {
  review: {
    aggregate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  mover: {
    update: jest.fn(),
  },
} as unknown as Prisma.TransactionClient;

describe("reviewRepository", () => {
  // 각 테스트 전에 모든 모킹을 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findReviewsByClientId", () => {
    test("내가 작성한 리뷰 목록과 총 개수를 정상 조회해야 한다", async () => {
      // Setup
      const clientId = "client-uuid";
      const offset = 0;
      const limit = 2;
      const fakeReviews = [
        {
          id: "review1",
          rating: 5,
          content: "Great",
          createdAt: new Date(),
          moverId: "mover1",
          mover: { nickName: "MoverNick", profileImage: "img.jpg" },
          estimate: {
            price: 10000,
            request: {
              moveType: MoveType.HOME,
              moveDate: new Date(),
              designatedRequests: [{ moverId: "mover1" }],
            },
          },
        },
      ];
      const fakeCount = 10;

      (mockedPrisma.review.findMany as jest.Mock).mockResolvedValue(fakeReviews);
      (mockedPrisma.review.count as jest.Mock).mockResolvedValue(fakeCount);

      // Exercise
      const result = await reviewRepository.findReviewsByClientId(clientId, offset, limit);

      // Assertion
      expect(mockedPrisma.review.findMany).toHaveBeenCalledWith({
        where: { clientId },
        select: expect.any(Object),
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });
      expect(mockedPrisma.review.count).toHaveBeenCalledWith({ where: { clientId } });
      expect(result).toEqual({ reviews: fakeReviews, total: fakeCount });
    });

    test("DB 에러 발생 시 예외를 던져야 한다", async () => {
      // Setup
      (mockedPrisma.review.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));

      // Exercise & Assertion
      await expect(reviewRepository.findReviewsByClientId("abc", 0, 5)).rejects.toThrow("DB error");
    });
  });

  describe("findReviewsByMoverId", () => {
    test("기사님에게 달린 리뷰 목록과 총 개수를 정상 조회해야 한다", async () => {
      // Setup
      const moverId = "mover-uuid";
      const offset = 0;
      const limit = 2;
      const fakeReviews = [
        {
          id: "review2",
          rating: 4,
          content: "Good job",
          createdAt: new Date(),
          client: { name: "ClientName" },
          estimate: {
            price: 15000,
            request: {
              moveType: MoveType.OFFICE,
              moveDate: new Date(),
              designatedRequests: [{ moverId }],
            },
          },
        },
      ];
      const fakeCount = 5;

      (mockedPrisma.review.findMany as jest.Mock).mockResolvedValue(fakeReviews);
      (mockedPrisma.review.count as jest.Mock).mockResolvedValue(fakeCount);

      // Exercise
      const result = await reviewRepository.findReviewsByMoverId(moverId, offset, limit);

      // Assertion
      expect(mockedPrisma.review.findMany).toHaveBeenCalledWith({
        where: { moverId },
        select: expect.any(Object),
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });
      expect(mockedPrisma.review.count).toHaveBeenCalledWith({ where: { moverId } });
      expect(result).toEqual({ reviews: fakeReviews, total: fakeCount });
    });
  });

  describe("updateMoverReviewStatsTx", () => {
    test("트랜잭션 내에서 리뷰 평점 및 개수를 집계하고 업데이트 해야 한다", async () => {
      // Setup
      const moverId = "mover-uuid";
      const stats = {
        _avg: { rating: 4.3 },
        _count: { rating: 10 },
      };
      (mockTxClient.review.aggregate as jest.Mock).mockResolvedValue(stats);

      // Exercise
      await reviewRepository.updateMoverReviewStatsTx(moverId, mockTxClient);

      // Assertion
      expect(mockTxClient.review.aggregate).toHaveBeenCalledWith({
        where: { moverId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      expect(mockTxClient.mover.update).toHaveBeenCalledWith({
        where: { id: moverId },
        data: {
          averageReviewRating: stats._avg.rating,
          reviewCount: stats._count.rating,
        },
      });
    });

    test("평균 평점이 null일 경우 0으로 처리해야 한다", async () => {
      // Setup
      const moverId = "mover-uuid";
      const stats = {
        _avg: { rating: null },
        _count: { rating: 0 },
      };
      (mockTxClient.review.aggregate as jest.Mock).mockResolvedValue(stats);

      // Exercise
      await reviewRepository.updateMoverReviewStatsTx(moverId, mockTxClient);

      // Assertion
      expect(mockTxClient.mover.update).toHaveBeenCalledWith({
        where: { id: moverId },
        data: {
          averageReviewRating: 0,
          reviewCount: 0,
        },
      });
    });
  });

  describe("createReviewTx", () => {
    test("트랜잭션 내에서 리뷰를 정상 생성해야 한다", async () => {
      // Setup
      const reviewData: Prisma.ReviewCreateInput = {
        rating: 5,
        content: "Excellent service",
        createdAt: new Date(),
        client: { connect: { id: "client1" } },
        mover: { connect: { id: "mover1" } },
        estimate: { connect: { id: "estimate1" } },
      };
      (mockTxClient.review.create as jest.Mock).mockResolvedValue(reviewData);

      // Exercise
      const result = await reviewRepository.createReviewTx(mockTxClient, reviewData);

      // Assertion
      expect(mockTxClient.review.create).toHaveBeenCalledWith({ data: reviewData });
      expect(result).toEqual(reviewData);
    });
  });

  describe("findReviewByEstimateId", () => {
    test("estimateId로 리뷰를 조회해야 한다", async () => {
      // Setup
      const estimateId = "estimate-uuid";
      const fakeReview = { id: "review1", rating: 5 } as Review;
      (mockedPrisma.review.findUnique as jest.Mock).mockResolvedValue(fakeReview);

      // Exercise
      const result = await reviewRepository.findReviewByEstimateId(estimateId);

      // Assertion
      expect(mockedPrisma.review.findUnique).toHaveBeenCalledWith({ where: { estimateId } });
      expect(result).toBe(fakeReview);
    });
  });

  describe("findReviewById", () => {
    test("reviewId로 리뷰를 조회해야 한다", async () => {
      // Setup
      const reviewId = "review-uuid";
      const fakeReview = { id: reviewId, rating: 4 } as Review;
      (mockedPrisma.review.findUnique as jest.Mock).mockResolvedValue(fakeReview);

      // Exercise
      const result = await reviewRepository.findReviewById(reviewId);

      // Assertion
      expect(mockedPrisma.review.findUnique).toHaveBeenCalledWith({ where: { id: reviewId } });
      expect(result).toBe(fakeReview);
    });
  });

  describe("updateReviewTx", () => {
    test("트랜잭션 내에서 리뷰를 업데이트해야 한다", async () => {
      // Setup
      const reviewId = "review-uuid";
      const updateData = { rating: 3, content: "Updated content" };
      (mockTxClient.review.update as jest.Mock).mockResolvedValue({ id: reviewId, ...updateData });

      // Exercise
      const result = await reviewRepository.updateReviewTx(mockTxClient, reviewId, updateData);

      // Assertion
      expect(mockTxClient.review.update).toHaveBeenCalledWith({
        where: { id: reviewId },
        data: updateData,
      });
      expect(result).toMatchObject(updateData);
    });
  });

  describe("deleteReviewTx", () => {
    test("트랜잭션 내에서 리뷰를 삭제해야 한다", async () => {
      // Setup
      const reviewId = "review-uuid";
      (mockTxClient.review.delete as jest.Mock).mockResolvedValue({ id: reviewId });

      // Exercise
      const result = await reviewRepository.deleteReviewTx(mockTxClient, reviewId);

      // Assertion
      expect(mockTxClient.review.delete).toHaveBeenCalledWith({ where: { id: reviewId } });
      expect(result).toEqual({ id: reviewId });
    });
  });
});
