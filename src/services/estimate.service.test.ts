import { PrismaClient, EstimateStatus } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../types";

// Mock PrismaClient before importing the service
const mockPrismaClient = {
  estimate: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  EstimateStatus: {
    CONFIRMED: "CONFIRMED",
    REJECTED: "REJECTED",
  },
  Provider: {
    GOOGLE: "GOOGLE",
    KAKAO: "KAKAO",
    NAVER: "NAVER",
    LOCAL: "LOCAL",
  },
}));

// Mock all dependencies
jest.mock("../repositories/estimate.repository");
jest.mock("../repositories/mover.repository");
jest.mock("../repositories/authClient.repository");
jest.mock("./notification.service");

// Import the service after mocking
import estimateService from "./estimate.service";
import estimateRepository from "../repositories/estimate.repository";
import moverRepository from "../repositories/mover.repository";
import authClientRepository from "../repositories/authClient.repository";
import notificationService from "./notification.service";

// Mock data
const mockClientId = "client-123";
const mockMoverId = "mover-456";
const mockRequestId = "request-789";
const mockEstimateId = "estimate-001";

const mockEstimateInput = {
  price: 200000,
  comment: "좋은 견적입니다",
  moverId: mockMoverId,
  clientId: mockClientId,
  requestId: mockRequestId,
};

const mockRequest = {
  id: mockRequestId,
  moveType: "HOME",
  moveDate: new Date("2024-01-15"),
  fromAddress: "서울시 강남구",
  toAddress: "서울시 서초구",
  requestedAt: new Date("2024-01-01"),
  designatedRequests: [{ moverId: mockMoverId }],
  client: { name: "김고객" },
  isPending: true,
};

const mockMover = {
  id: mockMoverId,
  name: "김기사",
  nickName: "김기사님",
  profileImage: "profile.jpg",
  averageReviewRating: 4.5,
  reviewCount: 20,
  career: 5,
  estimateCount: 100,
  favoriteCount: 50,
};

const mockClient = {
  id: mockClientId,
  name: "김고객",
  email: "client@test.com",
};

const mockEstimate = {
  id: mockEstimateId,
  price: 200000,
  comment: "좋은 견적입니다",
  moverStatus: EstimateStatus.CONFIRMED,
  isClientConfirmed: false,
  createdAt: new Date("2024-01-02"),
  moverId: mockMoverId,
  clientId: mockClientId,
  requestId: mockRequestId,
  request: mockRequest,
  mover: mockMover,
};

const mockPendingEstimateResponse = {
  estimates: [
    {
      ...mockEstimate,
      request: {
        ...mockRequest,
        designatedRequests: [{ moverId: mockMoverId }],
      },
      mover: mockMover,
    },
  ],
  totalCount: 1,
};

describe("EstimateService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPendingEstimates", () => {
    test("대기 중인 견적서 목록을 성공적으로 조회한다", async () => {
      (estimateRepository.findPendingEstimatesByClientId as jest.Mock).mockResolvedValue(
        mockPendingEstimateResponse,
      );
      (estimateRepository.isFavoriteMover as jest.Mock).mockResolvedValue(true);

      const result = await estimateService.getPendingEstimates(mockClientId, 0, 6);

      expect(estimateRepository.findPendingEstimatesByClientId).toHaveBeenCalledWith(
        mockClientId,
        0,
        6,
      );
      expect(estimateRepository.isFavoriteMover).toHaveBeenCalledWith(mockClientId, mockMoverId);
      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.data[0].estimate.isDesignated).toBe(true);
      expect(result.data[0].estimate.isFavorited).toBe(true);
    });

    test("기본 파라미터로 대기 중인 견적서를 조회한다", async () => {
      (estimateRepository.findPendingEstimatesByClientId as jest.Mock).mockResolvedValue({
        estimates: [],
        totalCount: 0,
      });

      const result = await estimateService.getPendingEstimates(mockClientId);

      expect(estimateRepository.findPendingEstimatesByClientId).toHaveBeenCalledWith(
        mockClientId,
        0,
        6,
      );
      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe("createEstimate", () => {
    test("견적을 성공적으로 생성한다", async () => {
      const mockCreatedEstimate = {
        id: mockEstimateId,
        price: mockEstimateInput.price,
        comment: mockEstimateInput.comment,
        moverStatus: EstimateStatus.CONFIRMED,
        clientId: mockClientId,
        moverId: mockMoverId,
        requestId: mockRequestId,
        createdAt: new Date(),
        updatedAt: new Date(),
        request: mockRequest, // request가 포함되어야 함
      };

      mockPrismaClient.estimate.create.mockResolvedValue(mockCreatedEstimate);
      (moverRepository.fetchMoverDetail as jest.Mock).mockResolvedValue(mockMover);
      (notificationService.notifyEstimate as jest.Mock).mockResolvedValue({});

      const result = await estimateService.createEstimate(mockEstimateInput);

      expect(mockPrismaClient.estimate.create).toHaveBeenCalledWith({
        data: {
          price: mockEstimateInput.price,
          comment: mockEstimateInput.comment,
          moverStatus: EstimateStatus.CONFIRMED,
          client: { connect: { id: mockClientId } },
          mover: { connect: { id: mockMoverId } },
          request: { connect: { id: mockRequestId } },
        },
        include: {
          request: true,
        },
      });

      expect(moverRepository.fetchMoverDetail).toHaveBeenCalledWith(mockMoverId);
      expect(notificationService.notifyEstimate).toHaveBeenCalledWith({
        clientId: mockClientId,
        moverName: mockMover.nickName,
        moveType: result.request.moveType,
        type: "NEW_ESTIMATE",
        targetId: result.id,
        targetUrl: `/my-quotes/client/${result.id}`,
      });

      expect(result).toEqual(mockCreatedEstimate);
    });

    test("가격 없이 견적을 생성한다", async () => {
      const inputWithoutPrice = {
        ...mockEstimateInput,
        price: undefined,
      };

      const mockCreatedEstimate = {
        id: mockEstimateId,
        price: null,
        comment: inputWithoutPrice.comment,
        moverStatus: EstimateStatus.CONFIRMED,
        clientId: mockClientId,
        moverId: mockMoverId,
        requestId: mockRequestId,
        createdAt: new Date(),
        updatedAt: new Date(),
        request: mockRequest, // request가 포함되어야 함
      };

      mockPrismaClient.estimate.create.mockResolvedValue(mockCreatedEstimate);
      (moverRepository.fetchMoverDetail as jest.Mock).mockResolvedValue(mockMover);
      (notificationService.notifyEstimate as jest.Mock).mockResolvedValue({});

      const result = await estimateService.createEstimate(inputWithoutPrice);

      expect(mockPrismaClient.estimate.create).toHaveBeenCalledWith({
        data: {
          price: undefined,
          comment: inputWithoutPrice.comment,
          moverStatus: EstimateStatus.CONFIRMED,
          client: { connect: { id: mockClientId } },
          mover: { connect: { id: mockMoverId } },
          request: { connect: { id: mockRequestId } },
        },
        include: {
          request: true,
        },
      });

      expect(result).toEqual(mockCreatedEstimate);
    });
  });

  describe("rejectEstimate", () => {
    test("견적을 성공적으로 거절한다", async () => {
      const mockRejectedEstimate = {
        id: mockEstimateId, // id가 포함되어야 함
        price: null,
        comment: "죄송합니다",
        moverStatus: EstimateStatus.REJECTED,
        clientId: mockClientId,
        moverId: mockMoverId,
        requestId: mockRequestId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.estimate.create.mockResolvedValue(mockRejectedEstimate);
      (moverRepository.fetchMoverDetail as jest.Mock).mockResolvedValue(mockMover);
      (notificationService.notifyEstimateRejcted as jest.Mock).mockResolvedValue({});

      const rejectInput = {
        comment: "죄송합니다",
        moverId: mockMoverId,
        clientId: mockClientId,
        requestId: mockRequestId,
      };

      const result = await estimateService.rejectEstimate(rejectInput);

      expect(mockPrismaClient.estimate.create).toHaveBeenCalledWith({
        data: {
          comment: rejectInput.comment,
          moverStatus: EstimateStatus.REJECTED,
          client: { connect: { id: mockClientId } },
          mover: { connect: { id: mockMoverId } },
          request: { connect: { id: mockRequestId } },
        },
      });

      expect(moverRepository.fetchMoverDetail).toHaveBeenCalledWith(mockMoverId);
      expect(notificationService.notifyEstimateRejcted).toHaveBeenCalledWith({
        userId: mockClientId,
        moverName: mockMover.nickName,
        type: "ESTIMATE_REJECTED",
        targetId: result.id,
        targetUrl: `/my-quotes/client/${result.id}`,
      });

      expect(result).toEqual(mockRejectedEstimate);
    });
  });

  describe("getPaginatedSentEstimates", () => {
    test("보낸 견적 목록을 조회한다", async () => {
      const mockSentEstimates = {
        estimates: [mockEstimate],
        totalCount: 1,
        totalPages: 1,
      };

      (estimateRepository.getPaginatedSentEstimates as jest.Mock).mockResolvedValue(
        mockSentEstimates,
      );

      const result = await estimateService.getPaginatedSentEstimates(mockMoverId, 1);

      expect(estimateRepository.getPaginatedSentEstimates).toHaveBeenCalledWith(mockMoverId, 1);
      expect(result).toEqual(mockSentEstimates);
    });
  });

  describe("findSentEstimateById", () => {
    test("보낸 견적 상세를 조회한다", async () => {
      const mockSentEstimateDetail = {
        id: mockEstimateId,
        price: 200000,
        moverId: mockMoverId,
        createdAt: new Date("2024-01-02"),
        isClientConfirmed: false,
        request: {
          moveType: "HOME",
          moveDate: new Date("2024-01-15"),
          fromAddress: "서울시 강남구",
          toAddress: "서울시 서초구",
          requestedAt: new Date("2024-01-01"),
          client: { name: "김고객" },
          designatedRequests: {
            select: {
              moverId: true,
            },
          },
        },
      };

      // mockPrismaClient의 findFirst를 직접 설정
      mockPrismaClient.estimate.findFirst.mockResolvedValue(mockSentEstimateDetail);

      const result = await estimateService.findSentEstimateById(mockMoverId, mockEstimateId);

      expect(mockPrismaClient.estimate.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockEstimateId,
          moverId: mockMoverId,
        },
        select: {
          id: true,
          price: true,
          moverId: true,
          createdAt: true,
          isClientConfirmed: true,
          request: {
            select: {
              moveType: true,
              moveDate: true,
              fromAddress: true,
              toAddress: true,
              requestedAt: true,
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
          },
        },
      });

      expect(result).toEqual(mockSentEstimateDetail);
    });
  });

  describe("getRejectedEstimates", () => {
    test("반려한 견적 목록을 조회한다", async () => {
      const mockRejectedEstimates = {
        estimates: [{ ...mockEstimate, moverStatus: EstimateStatus.REJECTED }],
        totalCount: 1,
        totalPages: 1,
      };

      (estimateRepository.getRejectedEstimates as jest.Mock).mockResolvedValue(
        mockRejectedEstimates,
      );

      const result = await estimateService.getRejectedEstimates(mockMoverId, 1);

      expect(estimateRepository.getRejectedEstimates).toHaveBeenCalledWith(mockMoverId, 1);
      expect(result).toEqual(mockRejectedEstimates);
    });
  });

  describe("getReceivedEstimates", () => {
    test("받은 견적 목록을 조회한다 (전체)", async () => {
      const mockReceivedEstimates = {
        estimates: [
          {
            ...mockEstimate,
            mover: mockMover,
            request: {
              ...mockRequest,
              designatedRequests: [{ moverId: mockMoverId }],
            },
          },
        ],
        totalCount: 1,
      };

      (estimateRepository.findReceivedEstimatesByClientId as jest.Mock).mockResolvedValue(
        mockReceivedEstimates,
      );
      (estimateRepository.isFavoriteMover as jest.Mock).mockResolvedValue(false);

      const result = await estimateService.getReceivedEstimates(mockClientId, 1, 10, "all");

      expect(estimateRepository.findReceivedEstimatesByClientId).toHaveBeenCalledWith(
        mockClientId,
        1,
        10,
        "all",
      );
      expect(estimateRepository.isFavoriteMover).toHaveBeenCalledWith(mockClientId, mockMoverId);
      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.data[0].estimate.isFavorited).toBe(false);
      expect(result.data[0].estimate.isConfirmed).toBe(false);
    });

    test("받은 견적 목록을 조회한다 (확정된 것만)", async () => {
      const confirmedEstimate = {
        ...mockEstimate,
        moverStatus: "CONFIRMED",
        isClientConfirmed: true,
        mover: mockMover,
        request: {
          ...mockRequest,
          designatedRequests: [{ moverId: mockMoverId }],
        },
      };

      const mockReceivedEstimates = {
        estimates: [confirmedEstimate],
        totalCount: 1,
      };

      (estimateRepository.findReceivedEstimatesByClientId as jest.Mock).mockResolvedValue(
        mockReceivedEstimates,
      );
      (estimateRepository.isFavoriteMover as jest.Mock).mockResolvedValue(true);

      const result = await estimateService.getReceivedEstimates(mockClientId, 1, 10, "confirmed");

      expect(estimateRepository.findReceivedEstimatesByClientId).toHaveBeenCalledWith(
        mockClientId,
        1,
        10,
        "confirmed",
      );
      expect(result.data[0].estimate.isConfirmed).toBe(true);
      expect(result.data[0].estimate.isFavorited).toBe(true);
    });
  });

  describe("confirmEstimate", () => {
    test("견적을 성공적으로 확정한다", async () => {
      const mockEstimateForConfirm = {
        clientId: mockClientId,
        moverId: mockMoverId,
        isClientConfirmed: false,
        request: { id: mockRequestId },
      };

      const mockTransactionResult = { estimateId: mockEstimateId, moverId: mockMoverId };

      // Transaction mock을 개선하여 callback 함수를 실행하고 올바른 결과를 반환하도록 설정
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          estimate: {
            findFirst: jest.fn(),
            update: jest.fn(),
          },
        };
        await callback(mockTx);
        return mockTransactionResult; // 올바른 결과 반환
      });

      (estimateRepository.findEstimateById as jest.Mock).mockResolvedValue(mockEstimateForConfirm);
      (estimateRepository.updateEstimateConfirmed as jest.Mock).mockResolvedValue({});
      (estimateRepository.incrementMoverEstimateCount as jest.Mock).mockResolvedValue({});
      (estimateRepository.updateRequestPendingFalse as jest.Mock).mockResolvedValue({});
      (moverRepository.fetchMoverDetail as jest.Mock).mockResolvedValue(mockMover);
      (authClientRepository.findById as jest.Mock).mockResolvedValue(mockClient);
      (notificationService.notifyEstimateConfirmed as jest.Mock).mockResolvedValue({});

      const result = await estimateService.confirmEstimate(mockEstimateId, mockClientId);

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(moverRepository.fetchMoverDetail).toHaveBeenCalledWith(mockMoverId);
      expect(authClientRepository.findById).toHaveBeenCalledWith(mockClientId);
      expect(notificationService.notifyEstimateConfirmed).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockTransactionResult);
    });

    test("존재하지 않는 견적으로 확정 시 BadRequestError를 던진다", async () => {
      // 에러가 발생하는 경우를 위해 estimateRepository.findEstimateById를 null로 설정
      (estimateRepository.findEstimateById as jest.Mock).mockResolvedValue(null);

      await expect(estimateService.confirmEstimate(mockEstimateId, mockClientId)).rejects.toThrow(
        new BadRequestError("견적을 찾을 수 없습니다."),
      );
    });

    test("권한이 없는 견적으로 확정 시 BadRequestError를 던진다", async () => {
      const mockEstimateForConfirm = {
        clientId: "other-client-id",
        moverId: mockMoverId,
        isClientConfirmed: false,
        request: { id: mockRequestId },
      };

      (estimateRepository.findEstimateById as jest.Mock).mockResolvedValue(mockEstimateForConfirm);

      await expect(estimateService.confirmEstimate(mockEstimateId, mockClientId)).rejects.toThrow(
        new BadRequestError("권한이 없습니다."),
      );
    });

    test("이미 확정된 견적으로 확정 시 BadRequestError를 던진다", async () => {
      const mockEstimateForConfirm = {
        clientId: mockClientId,
        moverId: mockMoverId,
        isClientConfirmed: true,
        request: { id: mockRequestId },
      };

      (estimateRepository.findEstimateById as jest.Mock).mockResolvedValue(mockEstimateForConfirm);

      await expect(estimateService.confirmEstimate(mockEstimateId, mockClientId)).rejects.toThrow(
        new BadRequestError("이미 확정된 견적입니다."),
      );
    });
  });

  describe("getEstimateDetail", () => {
    test("견적 상세를 성공적으로 조회한다", async () => {
      const mockEstimateDetail = {
        ...mockEstimate,
        request: mockRequest,
        mover: mockMover,
      };

      (estimateRepository.findEstimateDetailById as jest.Mock).mockResolvedValue(
        mockEstimateDetail,
      );
      (estimateRepository.findConfirmedEstimate as jest.Mock).mockResolvedValue(null);
      (estimateRepository.isFavoriteMover as jest.Mock).mockResolvedValue(true);

      const result = await estimateService.getEstimateDetail(mockEstimateId, mockClientId);

      expect(estimateRepository.findEstimateDetailById).toHaveBeenCalledWith(
        mockEstimateId,
        mockClientId,
      );
      expect(estimateRepository.findConfirmedEstimate).toHaveBeenCalledWith(mockRequestId);
      expect(estimateRepository.isFavoriteMover).toHaveBeenCalledWith(mockClientId, mockMoverId);

      expect(result).toEqual({
        id: mockEstimateId,
        price: 200000,
        moverStatus: EstimateStatus.CONFIRMED,
        isClientConfirmed: false,
        comment: "좋은 견적입니다",
        createdAt: mockEstimate.createdAt,
        status: "pending",
        request: mockRequest,
        mover: mockMover,
        isFavorite: true,
      });
    });

    test("다른 견적이 확정된 경우 status가 received로 반환된다", async () => {
      const mockEstimateDetail = {
        ...mockEstimate,
        request: mockRequest,
        mover: mockMover,
      };

      const mockConfirmedEstimate = { id: "other-estimate-id" };

      (estimateRepository.findEstimateDetailById as jest.Mock).mockResolvedValue(
        mockEstimateDetail,
      );
      (estimateRepository.findConfirmedEstimate as jest.Mock).mockResolvedValue(
        mockConfirmedEstimate,
      );
      (estimateRepository.isFavoriteMover as jest.Mock).mockResolvedValue(false);

      const result = await estimateService.getEstimateDetail(mockEstimateId, mockClientId);

      expect(result.status).toBe("received");
      expect(result.isFavorite).toBe(false);
    });

    test("존재하지 않는 견적 조회 시 NotFoundError를 던진다", async () => {
      (estimateRepository.findEstimateDetailById as jest.Mock).mockResolvedValue(null);

      await expect(estimateService.getEstimateDetail(mockEstimateId, mockClientId)).rejects.toThrow(
        new NotFoundError("견적을 찾을 수 없습니다."),
      );
    });
  });

  describe("deleteEstimate", () => {
    test("견적을 성공적으로 삭제한다", async () => {
      const mockEstimateForDelete = {
        id: mockEstimateId,
        moverId: mockMoverId,
        moverStatus: "CONFIRMED",
        isClientConfirmed: false,
      };

      (estimateRepository.findById as jest.Mock).mockResolvedValue(mockEstimateForDelete);
      (estimateRepository.deleteById as jest.Mock).mockResolvedValue(mockEstimateForDelete);

      const result = await estimateService.deleteEstimate(mockEstimateId, mockMoverId);

      expect(estimateRepository.findById).toHaveBeenCalledWith(mockEstimateId);
      expect(estimateRepository.deleteById).toHaveBeenCalledWith(mockEstimateId);
      expect(result).toEqual(mockEstimateForDelete);
    });

    test("존재하지 않는 견적 삭제 시 null을 반환한다", async () => {
      (estimateRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await estimateService.deleteEstimate(mockEstimateId, mockMoverId);

      expect(estimateRepository.findById).toHaveBeenCalledWith(mockEstimateId);
      expect(estimateRepository.deleteById).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("권한이 없는 견적 삭제 시 null을 반환한다", async () => {
      const mockEstimateForDelete = {
        id: mockEstimateId,
        moverId: "other-mover-id",
        moverStatus: "CONFIRMED",
        isClientConfirmed: false,
      };

      (estimateRepository.findById as jest.Mock).mockResolvedValue(mockEstimateForDelete);

      const result = await estimateService.deleteEstimate(mockEstimateId, mockMoverId);

      expect(estimateRepository.findById).toHaveBeenCalledWith(mockEstimateId);
      expect(estimateRepository.deleteById).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("확정된 견적 삭제 시 null을 반환한다", async () => {
      const mockEstimateForDelete = {
        id: mockEstimateId,
        moverId: mockMoverId,
        moverStatus: "CONFIRMED",
        isClientConfirmed: true,
      };

      (estimateRepository.findById as jest.Mock).mockResolvedValue(mockEstimateForDelete);

      const result = await estimateService.deleteEstimate(mockEstimateId, mockMoverId);

      expect(estimateRepository.findById).toHaveBeenCalledWith(mockEstimateId);
      expect(estimateRepository.deleteById).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("잘못된 상태의 견적 삭제 시 null을 반환한다", async () => {
      const mockEstimateForDelete = {
        id: mockEstimateId,
        moverId: mockMoverId,
        moverStatus: "PENDING",
        isClientConfirmed: false,
      };

      (estimateRepository.findById as jest.Mock).mockResolvedValue(mockEstimateForDelete);

      const result = await estimateService.deleteEstimate(mockEstimateId, mockMoverId);

      expect(estimateRepository.findById).toHaveBeenCalledWith(mockEstimateId);
      expect(estimateRepository.deleteById).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("getEstimateById", () => {
    test("견적을 ID로 조회한다", async () => {
      (estimateRepository.findEstimate as jest.Mock).mockResolvedValue(mockEstimate);

      const result = await estimateService.getEstimateById(mockEstimateId);

      expect(estimateRepository.findEstimate).toHaveBeenCalledWith(mockEstimateId);
      expect(result).toEqual(mockEstimate);
    });

    test("존재하지 않는 견적 조회 시 null을 반환한다", async () => {
      (estimateRepository.findEstimate as jest.Mock).mockResolvedValue(null);

      const result = await estimateService.getEstimateById(mockEstimateId);

      expect(estimateRepository.findEstimate).toHaveBeenCalledWith(mockEstimateId);
      expect(result).toBeNull();
    });
  });
});
