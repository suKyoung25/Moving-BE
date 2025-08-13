// Jest 모킹을 파일 최상단에 배치 (호이스팅 문제 해결)
const mockPrisma = {
  estimate: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  favorite: {
    findUnique: jest.fn(),
  },
  request: {
    update: jest.fn(),
  },
  mover: {
    update: jest.fn(),
  },
};

jest.mock("@prisma/client", () => {
  const rest = jest.requireActual("@prisma/client");
  return { ...rest, PrismaClient: jest.fn(() => mockPrisma) };
});

// 모킹 후 estimateRepository import
import estimateRepository from "./estimate.repository";

const mockTxClient = {
  estimate: {
    aggregate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
  mover: {
    update: jest.fn(),
  },
  request: {
    update: jest.fn(),
  },
} as any;

describe("EstimateRepository", () => {
  // 각 테스트 전에 모든 모킹을 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEstimateMoverId", () => {
    test("견적 ID로 기사 ID를 정상 조회해야 한다", async () => {
      const estimateId = "estimate-uuid";
      const fakeEstimate = {
        id: "estimate-uuid",
        clientId: "client-uuid",
        moverId: "mover-uuid",
        requestId: "request-uuid",
        price: 100000,
        moverStatus: "CONFIRMED" as const,
        isClientConfirmed: false,
        comment: "테스트 견적",
        createdAt: new Date(),
      };

      mockPrisma.estimate.findUnique.mockResolvedValue(fakeEstimate);

      const result = await estimateRepository.getEstimateMoverId(estimateId);

      expect(mockPrisma.estimate.findUnique).toHaveBeenCalledWith({
        where: { id: estimateId },
        select: { moverId: true },
      });
      expect(result).toEqual(fakeEstimate);
    });

    test("오류 발생 시 ServerError를 던져야 한다", async () => {
      const error = new Error("Database error");
      mockPrisma.estimate.findUnique.mockRejectedValue(error);

      await expect(estimateRepository.getEstimateMoverId("estimate-uuid")).rejects.toThrow(
        "견적 조회 중 서버 오류가 발생했습니다.",
      );
    });
  });

  describe("isFavoriteMover", () => {
    test("찜한 기사님 여부를 정상 확인해야 한다", async () => {
      const clientId = "client-uuid";
      const moverId = "mover-uuid";
      const fakeFavorite = { id: "favorite1", clientId, moverId };

      mockPrisma.favorite.findUnique.mockResolvedValue(fakeFavorite);

      const result = await estimateRepository.isFavoriteMover(clientId, moverId);

      expect(mockPrisma.favorite.findUnique).toHaveBeenCalledWith({
        where: {
          clientId_moverId: {
            clientId,
            moverId,
          },
        },
      });
      expect(result).toEqual(fakeFavorite);
    });

    test("찜하지 않은 기사님인 경우 null을 반환해야 한다", async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(null);

      const result = await estimateRepository.isFavoriteMover("client-uuid", "mover-uuid");

      expect(result).toBeNull();
    });

    test("오류 발생 시 ServerError를 던져야 한다", async () => {
      const error = new Error("Database error");
      mockPrisma.favorite.findUnique.mockRejectedValue(error);

      await expect(estimateRepository.isFavoriteMover("client-uuid", "mover-uuid")).rejects.toThrow(
        "찜한 기사님을 조회 중 서버 오류가 발생했습니다",
      );
    });
  });

  describe("findEstimateByMoveDate", () => {
    test("이사 날짜에 해당하는 견적을 정상 찾아야 한다", async () => {
      const startDate = new Date("2023-12-01");
      const endDate = new Date("2023-12-02");
      const fakeEstimates = [
        {
          id: "estimate1",
          clientId: "client-uuid",
          moverId: "mover-uuid",
          requestId: "request-uuid",
          price: 100000,
          moverStatus: "CONFIRMED" as const,
          isClientConfirmed: true,
          comment: "테스트 견적 1",
          createdAt: new Date(),
          request: {
            fromAddress: "서울시 강남구",
            toAddress: "서울시 서초구",
          },
        },
        {
          id: "estimate2",
          clientId: "client-uuid",
          moverId: "mover-uuid",
          requestId: "request-uuid",
          price: 120000,
          moverStatus: "CONFIRMED" as const,
          isClientConfirmed: true,
          comment: "테스트 견적 2",
          createdAt: new Date(),
          request: {
            fromAddress: "서울시 서초구",
            toAddress: "서울시 강남구",
          },
        },
      ];

      mockPrisma.estimate.findMany.mockResolvedValue(fakeEstimates);

      const result = await estimateRepository.findEstimateByMoveDate(startDate, endDate);

      expect(mockPrisma.estimate.findMany).toHaveBeenCalledWith({
        where: {
          moverStatus: "CONFIRMED",
          isClientConfirmed: true,
          request: {
            isPending: false,
            moveDate: {
              gte: startDate,
              lt: endDate,
            },
          },
        },
        include: {
          request: {
            select: {
              fromAddress: true,
              toAddress: true,
            },
          },
        },
      });
      expect(result).toEqual(fakeEstimates);
    });
  });

  describe("updateEstimateConfirmed", () => {
    test("트랜잭션 내에서 견적을 확정 상태로 정상 업데이트해야 한다", async () => {
      const estimateId = "estimate-uuid";
      const fakeUpdatedEstimate = { id: estimateId, isClientConfirmed: true };

      mockTxClient.estimate.update.mockResolvedValue(fakeUpdatedEstimate);

      const result = await estimateRepository.updateEstimateConfirmed(mockTxClient, estimateId);

      expect(mockTxClient.estimate.update).toHaveBeenCalledWith({
        where: { id: estimateId },
        data: { isClientConfirmed: true },
      });
      expect(result).toEqual(fakeUpdatedEstimate);
    });
  });

  describe("incrementMoverEstimateCount", () => {
    test("트랜잭션 내에서 기사님의 견적 카운트를 정상 증가시켜야 한다", async () => {
      const moverId = "mover-uuid";
      const fakeUpdatedMover = { id: moverId, estimateCount: 21 };

      mockTxClient.mover.update.mockResolvedValue(fakeUpdatedMover);

      const result = await estimateRepository.incrementMoverEstimateCount(mockTxClient, moverId);

      expect(mockTxClient.mover.update).toHaveBeenCalledWith({
        where: { id: moverId },
        data: { estimateCount: { increment: 1 } },
      });
      expect(result).toEqual(fakeUpdatedMover);
    });
  });

  describe("findEstimateById", () => {
    test("트랜잭션 내에서 견적을 정상 조회해야 한다", async () => {
      const estimateId = "estimate-uuid";
      const fakeEstimate = {
        isClientConfirmed: false,
        moverId: "mover-uuid",
        clientId: "client-uuid",
        request: { id: "request-uuid" },
      };

      mockTxClient.estimate.findUnique.mockResolvedValue(fakeEstimate);

      const result = await estimateRepository.findEstimateById(mockTxClient, estimateId);

      expect(mockTxClient.estimate.findUnique).toHaveBeenCalledWith({
        where: { id: estimateId },
        select: {
          isClientConfirmed: true,
          moverId: true,
          clientId: true,
          request: { select: { id: true } },
        },
      });
      expect(result).toEqual(fakeEstimate);
    });
  });

  describe("updateRequestPendingFalse", () => {
    test("트랜잭션 내에서 요청의 pending 상태를 false로 정상 변경해야 한다", async () => {
      const requestId = "request-uuid";
      const fakeUpdatedRequest = { id: requestId, isPending: false };

      mockTxClient.request.update.mockResolvedValue(fakeUpdatedRequest);

      const result = await estimateRepository.updateRequestPendingFalse(mockTxClient, requestId);

      expect(mockTxClient.request.update).toHaveBeenCalledWith({
        where: { id: requestId },
        data: { isPending: false },
      });
      expect(result).toEqual(fakeUpdatedRequest);
    });
  });

  describe("findConfirmedEstimate", () => {
    test("확정된 견적을 정상 찾아야 한다", async () => {
      const requestId = "request-uuid";
      const fakeEstimate = {
        id: "estimate-uuid",
        clientId: "client-uuid",
        moverId: "mover-uuid",
        requestId: "request-uuid",
        price: 100000,
        moverStatus: "CONFIRMED" as const,
        isClientConfirmed: true,
        comment: "테스트 견적",
        createdAt: new Date(),
      };

      mockPrisma.estimate.findFirst.mockResolvedValue(fakeEstimate);

      const result = await estimateRepository.findConfirmedEstimate(requestId);

      expect(mockPrisma.estimate.findFirst).toHaveBeenCalledWith({
        where: {
          requestId,
          isClientConfirmed: true,
        },
      });
      expect(result).toEqual(fakeEstimate);
    });
  });

  describe("findById", () => {
    test("ID로 견적을 정상 조회해야 한다", async () => {
      const estimateId = "estimate-uuid";
      const fakeEstimate = {
        id: estimateId,
        clientId: "client-uuid",
        moverId: "mover-uuid",
        requestId: "request-uuid",
        price: 100000,
        moverStatus: "CONFIRMED" as const,
        isClientConfirmed: false,
        comment: "테스트 견적",
        createdAt: new Date(),
      };

      mockPrisma.estimate.findUnique.mockResolvedValue(fakeEstimate);

      const result = await estimateRepository.findById(estimateId);

      expect(mockPrisma.estimate.findUnique).toHaveBeenCalledWith({
        where: { id: estimateId },
        select: {
          id: true,
          moverId: true,
          moverStatus: true,
          isClientConfirmed: true,
        },
      });
      expect(result).toEqual(fakeEstimate);
    });
  });

  describe("deleteById", () => {
    test("ID로 견적을 정상 삭제해야 한다", async () => {
      const estimateId = "estimate-uuid";
      const fakeDeletedEstimate = {
        id: estimateId,
        clientId: "client-uuid",
        moverId: "mover-uuid",
        requestId: "request-uuid",
        price: 100000,
        moverStatus: "CONFIRMED" as const,
        isClientConfirmed: false,
        comment: "테스트 견적",
        createdAt: new Date(),
      };

      mockPrisma.estimate.delete.mockResolvedValue(fakeDeletedEstimate);

      const result = await estimateRepository.deleteById(estimateId);

      expect(mockPrisma.estimate.delete).toHaveBeenCalledWith({
        where: { id: estimateId },
      });
      expect(result).toEqual(fakeDeletedEstimate);
    });
  });

  describe("findEstimate", () => {
    test("견적 ID로 견적을 정상 찾아야 한다", async () => {
      const estimateId = "estimate-uuid";
      const fakeEstimate = {
        id: estimateId,
        clientId: "client-uuid",
        moverId: "mover-uuid",
        requestId: "request-uuid",
        price: 100000,
        moverStatus: "CONFIRMED" as const,
        isClientConfirmed: false,
        comment: "테스트 견적",
        createdAt: new Date(),
      };

      mockPrisma.estimate.findFirst.mockResolvedValue(fakeEstimate);

      const result = await estimateRepository.findEstimate(estimateId);

      expect(mockPrisma.estimate.findFirst).toHaveBeenCalledWith({
        where: { id: estimateId },
      });
      expect(result).toEqual(fakeEstimate);
    });
  });
});
