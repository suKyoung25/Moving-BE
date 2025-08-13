// Jest 모킹을 파일 최상단에 배치 (호이스팅 문제 해결)
const mockPrisma = {
  requestDraft: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
  request: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  mover: {
    findUnique: jest.fn(),
  },
  designatedRequest: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock("@prisma/client", () => {
  const rest = jest.requireActual("@prisma/client");
  return { ...rest, PrismaClient: jest.fn(() => mockPrisma) };
});

// 모킹 후 requestRepository import
import requestRepository from "./request.repository";
import { BadRequestError, ConflictError, NotFoundError, ServerError } from "../types";
import { Prisma, MoveType } from "@prisma/client";

describe("RequestRepository", () => {
  // 각 테스트 전에 모든 모킹을 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRequestDraftById", () => {
    test("클라이언트 ID로 요청 초안을 정상 조회해야 한다", async () => {
      const clientId = "client-uuid";
      const fakeDraft = {
        id: "draft1",
        clientId,
        moveType: MoveType.HOME,
        moveDate: new Date("2023-12-01"),
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
        currentStep: 2,
        updatedAt: new Date(),
      };

      mockPrisma.requestDraft.findUnique.mockResolvedValue(fakeDraft);

      const result = await requestRepository.getRequestDraftById(clientId);

      expect(mockPrisma.requestDraft.findUnique).toHaveBeenCalledWith({
        where: { clientId },
      });
      expect(result).toEqual(fakeDraft);
    });

    test("존재하지 않는 초안 조회 시 null을 반환해야 한다", async () => {
      mockPrisma.requestDraft.findUnique.mockResolvedValue(null);

      const result = await requestRepository.getRequestDraftById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("saveRequestDraft", () => {
    test("새로운 요청 초안을 정상 저장해야 한다", async () => {
      const clientId = "client-uuid";
      const draftData = {
        moveType: MoveType.HOME,
        moveDate: new Date("2023-12-01"),
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
      };
      const fakeDraft = {
        id: "draft1",
        clientId,
        ...draftData,
        currentStep: 0,
        updatedAt: new Date(),
      };

      mockPrisma.requestDraft.upsert.mockResolvedValue(fakeDraft);

      const result = await requestRepository.saveRequestDraft(clientId, draftData);

      expect(mockPrisma.requestDraft.upsert).toHaveBeenCalledWith({
        where: { clientId },
        update: {
          ...draftData,
          updatedAt: expect.any(Date),
        },
        create: {
          clientId,
          ...draftData,
        },
      });
      expect(result).toEqual(fakeDraft);
    });

    test("기존 초안을 정상 업데이트해야 한다", async () => {
      const clientId = "client-uuid";
      const updateData = { moveType: MoveType.OFFICE };
      const fakeDraft = {
        id: "draft1",
        clientId,
        moveType: MoveType.OFFICE,
        moveDate: null,
        fromAddress: null,
        toAddress: null,
        currentStep: 0,
        updatedAt: new Date(),
      };

      mockPrisma.requestDraft.upsert.mockResolvedValue(fakeDraft);

      const result = await requestRepository.saveRequestDraft(clientId, updateData);

      expect(mockPrisma.requestDraft.upsert).toHaveBeenCalledWith({
        where: { clientId },
        update: {
          ...updateData,
          updatedAt: expect.any(Date),
        },
        create: {
          clientId,
          ...updateData,
        },
      });
      expect(result).toEqual(fakeDraft);
    });
  });

  describe("getRequestsByClientId", () => {
    test("클라이언트 ID로 요청 목록을 정상 조회해야 한다", async () => {
      const clientId = "client-uuid";
      const limit = 6;
      const sort = "desc";
      const fakeRequests = [
        {
          id: "request1",
          clientId,
          moveType: MoveType.HOME,
          moveDate: new Date("2023-12-01"),
          fromAddress: "서울시 강남구",
          toAddress: "서울시 서초구",
          isPending: true,
          requestedAt: new Date(),
          estimates: [],
        },
        {
          id: "request2",
          clientId,
          moveType: MoveType.OFFICE,
          moveDate: new Date("2023-12-15"),
          fromAddress: "서울시 서초구",
          toAddress: "서울시 강남구",
          isPending: false,
          requestedAt: new Date(),
          estimates: [{ id: "estimate1" }],
        },
      ];

      mockPrisma.request.findMany.mockResolvedValue(fakeRequests);

      const result = await requestRepository.getRequestsByClientId({
        clientId,
        limit,
        sort,
      });

      expect(mockPrisma.request.findMany).toHaveBeenCalledWith({
        where: { clientId },
        include: { estimates: true },
        take: limit + 1,
        orderBy: { requestedAt: sort },
      });
      expect(result.requests).toEqual(fakeRequests.slice(0, limit));
      expect(result.nextCursor).toBeNull();
    });

    test("커서가 있을 때 다음 페이지를 정상 조회해야 한다", async () => {
      const clientId = "client-uuid";
      const limit = 6;
      const cursor = "request1";
      const fakeRequests: Array<{
        id: string;
        clientId: string;
        moveType: any;
        moveDate: Date;
        fromAddress: string;
        toAddress: string;
        isPending: boolean;
        requestedAt: Date;
        estimates: any[];
      }> = [
        {
          id: "request1",
          clientId,
          moveType: MoveType.HOME,
          moveDate: new Date("2023-12-01"),
          fromAddress: "서울시 강남구",
          toAddress: "서울시 서초구",
          isPending: true,
          requestedAt: new Date(),
          estimates: [],
        },
        {
          id: "request2",
          clientId,
          moveType: MoveType.HOME,
          moveDate: new Date("2023-12-01"),
          fromAddress: "서울시 강남구",
          toAddress: "서울시 서초구",
          isPending: true,
          requestedAt: new Date(),
          estimates: [],
        },
        {
          id: "request3",
          clientId,
          moveType: MoveType.HOME,
          moveDate: new Date("2023-12-01"),
          fromAddress: "서울시 강남구",
          toAddress: "서울시 서초구",
          isPending: true,
          requestedAt: new Date(),
          estimates: [],
        },
        {
          id: "request4",
          clientId,
          moveType: MoveType.HOME,
          moveDate: new Date("2023-12-01"),
          fromAddress: "서울시 강남구",
          toAddress: "서울시 서초구",
          isPending: true,
          requestedAt: new Date(),
          estimates: [],
        },
        {
          id: "request5",
          clientId,
          moveType: MoveType.HOME,
          moveDate: new Date("2023-12-01"),
          fromAddress: "서울시 강남구",
          toAddress: "서울시 서초구",
          isPending: true,
          requestedAt: new Date(),
          estimates: [],
        },
        {
          id: "request6",
          clientId,
          moveType: MoveType.HOME,
          moveDate: new Date("2023-12-01"),
          fromAddress: "서울시 강남구",
          toAddress: "서울시 서초구",
          isPending: true,
          requestedAt: new Date(),
          estimates: [],
        },
        {
          id: "request7",
          clientId,
          moveType: MoveType.HOME,
          moveDate: new Date("2023-12-01"),
          fromAddress: "서울시 강남구",
          toAddress: "서울시 서초구",
          isPending: true,
          requestedAt: new Date(),
          estimates: [],
        },
      ];

      mockPrisma.request.findMany.mockResolvedValue(fakeRequests);

      const result = await requestRepository.getRequestsByClientId({
        clientId,
        limit,
        cursor,
        sort: "desc",
      });

      expect(mockPrisma.request.findMany).toHaveBeenCalledWith({
        where: { clientId },
        include: { estimates: true },
        take: limit + 1,
        orderBy: { requestedAt: "desc" },
        cursor: { id: cursor },
        skip: 1,
      });
      expect(result.requests).toEqual(fakeRequests.slice(0, limit));
      expect(result.nextCursor).toBe("request6");
    });

    test("기본값으로 limit 6, sort desc를 사용해야 한다", async () => {
      const clientId = "client-uuid";
      const fakeRequests: Array<{
        id: string;
        clientId: string;
        moveType: any;
        moveDate: Date;
        fromAddress: string;
        toAddress: string;
        isPending: boolean;
        requestedAt: Date;
        estimates: any[];
      }> = [];

      mockPrisma.request.findMany.mockResolvedValue(fakeRequests);

      await requestRepository.getRequestsByClientId({ clientId });

      expect(mockPrisma.request.findMany).toHaveBeenCalledWith({
        where: { clientId },
        include: { estimates: true },
        take: 7,
        orderBy: { requestedAt: "desc" },
      });
    });
  });

  describe("createEstimateRequest", () => {
    test("견적 요청을 정상 생성하고 초안을 삭제해야 한다", async () => {
      const clientId = "client-uuid";
      const requestData = {
        moveType: MoveType.HOME,
        moveDate: new Date("2023-12-01"),
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
      };
      const fakeRequest = {
        id: "request1",
        clientId,
        ...requestData,
        isPending: true,
        requestedAt: new Date(),
      };
      const fakeDeleteResult = { id: "draft1" };

      mockPrisma.request.create.mockResolvedValue(fakeRequest);
      mockPrisma.requestDraft.delete.mockResolvedValue(fakeDeleteResult);

      const result = await requestRepository.createEstimateRequest(requestData, clientId);

      expect(mockPrisma.request.create).toHaveBeenCalledWith({
        data: {
          ...requestData,
          client: {
            connect: { id: clientId },
          },
        },
      });
      expect(mockPrisma.requestDraft.delete).toHaveBeenCalledWith({
        where: { clientId },
      });
      expect(result).toEqual(fakeRequest);
    });
  });

  describe("designateMover", () => {
    test("지정 견적 요청을 정상 생성해야 한다", async () => {
      const requestId = "request-uuid";
      const moverId = "mover-uuid";
      const clientId = "client-uuid";
      const fakeRequest = {
        id: requestId,
        isPending: true,
        clientId,
        moveType: MoveType.HOME,
        moveDate: new Date("2023-12-01"),
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
        requestedAt: new Date(),
      };
      const fakeMover = {
        id: moverId,
        nickName: "테스트기사",
        email: "test@test.com",
        name: "테스트기사",
        phone: "010-1234-5678",
        hashedPassword: "hash",
        profileImage: null,
        provider: "LOCAL" as any,
        providerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        career: null,
        introduction: null,
        description: null,
        serviceType: [],
        favoriteCount: 0,
        estimateCount: 0,
        averageReviewRating: 0,
        reviewCount: 0,
        isProfileCompleted: false,
      };
      const fakeDesignatedRequest = {
        id: "designated1",
        requestId,
        moverId,
        createdAt: new Date(),
      };

      mockPrisma.request.findFirst.mockResolvedValue(fakeRequest);
      mockPrisma.mover.findUnique.mockResolvedValue(fakeMover);
      mockPrisma.designatedRequest.findUnique.mockResolvedValue(null);
      mockPrisma.designatedRequest.create.mockResolvedValue(fakeDesignatedRequest);

      const result = await requestRepository.designateMover(requestId, moverId, clientId);

      expect(mockPrisma.request.findFirst).toHaveBeenCalledWith({
        where: {
          id: requestId,
          clientId,
          isPending: true,
        },
        select: { id: true, isPending: true, clientId: true },
      });
      expect(mockPrisma.mover.findUnique).toHaveBeenCalledWith({
        where: { id: moverId },
        select: { id: true, nickName: true },
      });
      expect(mockPrisma.designatedRequest.findUnique).toHaveBeenCalledWith({
        where: {
          requestId_moverId: {
            requestId,
            moverId,
          },
        },
      });
      expect(mockPrisma.designatedRequest.create).toHaveBeenCalledWith({
        data: {
          requestId,
          moverId,
        },
      });
      expect(result).toEqual(fakeDesignatedRequest);
    });

    test("이미 지정 요청한 기사인 경우 ConflictError를 던져야 한다", async () => {
      const requestId = "request-uuid";
      const moverId = "mover-uuid";
      const clientId = "client-uuid";
      const fakeRequest = {
        id: requestId,
        isPending: true,
        clientId,
        moveType: MoveType.HOME,
        moveDate: new Date("2023-12-01"),
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
        requestedAt: new Date(),
      };
      const fakeMover = {
        id: moverId,
        nickName: "테스트기사",
        email: "test@test.com",
        name: "테스트기사",
        phone: "010-1234-5678",
        hashedPassword: "hash",
        profileImage: null,
        provider: "LOCAL" as any,
        providerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        career: null,
        introduction: null,
        description: null,
        serviceType: [],
        favoriteCount: 0,
        estimateCount: 0,
        averageReviewRating: 0,
        reviewCount: 0,
        isProfileCompleted: false,
      };

      mockPrisma.request.findFirst.mockResolvedValue(fakeRequest);
      mockPrisma.mover.findUnique.mockResolvedValue(fakeMover);
      mockPrisma.designatedRequest.findUnique.mockResolvedValue({
        id: "existing1",
        requestId,
        moverId,
        createdAt: new Date(),
      });

      await expect(requestRepository.designateMover(requestId, moverId, clientId)).rejects.toThrow(
        ConflictError,
      );
    });

    test("요청이 완료된 경우 BadRequestError를 던져야 한다", async () => {
      const requestId = "request-uuid";
      const moverId = "mover-uuid";
      const clientId = "client-uuid";
      const fakeRequest = {
        id: requestId,
        isPending: false,
        clientId,
        moveType: MoveType.HOME,
        moveDate: new Date("2023-12-01"),
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
        requestedAt: new Date(),
      };

      // clientId가 제공되지 않은 경우의 로직을 테스트
      mockPrisma.request.findFirst.mockResolvedValue(null);
      mockPrisma.request.findUnique.mockResolvedValue(fakeRequest);

      await expect(requestRepository.designateMover(requestId, moverId)).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe("findRequestDetailById", () => {
    test("기사님이 요청 상세를 정상 조회해야 한다", async () => {
      const requestId = "request-uuid";
      const moverId = "mover-uuid";
      const fakeRequest = {
        id: requestId,
        clientId: "client-uuid",
        moveType: MoveType.HOME,
        moveDate: new Date("2023-12-01"),
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
        isPending: true,
        requestedAt: new Date(),
        client: { name: "테스트고객" },
        designatedRequests: [{ moverId }],
      };

      mockPrisma.request.findUnique.mockResolvedValue(fakeRequest);

      const result = await requestRepository.findRequestDetailById(requestId, moverId);

      expect(mockPrisma.request.findUnique).toHaveBeenCalledWith({
        where: { id: requestId },
        include: {
          client: {
            select: {
              name: true,
            },
          },
          designatedRequests: {
            select: {
              moverId: true,
            },
          },
        },
      });
      expect(result?.isDesignated).toBe(true);
    });

    test("요청이 존재하지 않는 경우 null을 반환해야 한다", async () => {
      mockPrisma.request.findUnique.mockResolvedValue(null);

      const result = await requestRepository.findRequestDetailById("non-existent", "mover-uuid");

      expect(result).toBeNull();
    });
  });

  describe("기본 동작 테스트", () => {
    test("모듈이 정상적으로 로드되어야 한다", () => {
      expect(requestRepository).toBeDefined();
      expect(typeof requestRepository.getRequestDraftById).toBe("function");
      expect(typeof requestRepository.saveRequestDraft).toBe("function");
      expect(typeof requestRepository.getRequestsByClientId).toBe("function");
      expect(typeof requestRepository.createEstimateRequest).toBe("function");
      expect(typeof requestRepository.designateMover).toBe("function");
      expect(typeof requestRepository.findRequestDetailById).toBe("function");
    });

    test("모든 메서드가 함수여야 한다", () => {
      const methods = [
        "getRequestDraftById",
        "saveRequestDraft",
        "getRequestsByClientId",
        "createEstimateRequest",
        "deleteEstimateRequest",
        "getFilteredRequests",
        "findPendingRequestById",
        "designateMover",
        "findRequest",
        "findRequestDetailById",
        "findRequestDetailByClientId",
      ];

      methods.forEach((method) => {
        expect(typeof requestRepository[method as keyof typeof requestRepository]).toBe("function");
      });
    });
  });
});
