import { MoveType } from "@prisma/client";
import prisma from "../configs/prisma.config";
import favoriteRepository from "./favorite.repository";

jest.mock("../configs/prisma.config", () => ({
  favorite: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("favoriteRepository", () => {
  // 각 테스트 전에 모든 모킹 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findFavoriteMoverByClientId", () => {
    test("찜한 기사님 목록을 페이지네이션과 함께 정상 조회해야 한다", async () => {
      // Setup
      const clientId = "client-uuid";
      const offset = 0;
      const limit = 2;
      const page = 1;

      const fakeFavorites = [
        {
          mover: {
            id: "mover1",
            nickName: "MoverNick",
            profileImage: "profile.jpg",
            averageReviewRating: 4.5,
            reviewCount: 10,
            career: 5,
            estimateCount: 20,
            favoriteCount: 100,
            serviceType: [MoveType.HOME, MoveType.OFFICE],
          },
        },
        {
          mover: {
            id: "mover2",
            nickName: "MoverNick2",
            profileImage: "profile2.jpg",
            averageReviewRating: 4.0,
            reviewCount: 6,
            career: 3,
            estimateCount: 12,
            favoriteCount: 50,
            serviceType: [MoveType.SMALL],
          },
        },
      ];

      const total = 10;

      // prisma.favorite.findMany와 count 모킹
      (mockedPrisma.favorite.findMany as jest.Mock).mockResolvedValue(fakeFavorites);
      (mockedPrisma.favorite.count as jest.Mock).mockResolvedValue(total);

      // Exercise
      const result = await favoriteRepository.findFavoriteMoverByClientId(
        clientId,
        offset,
        limit,
        page,
      );

      // Assertion
      expect(mockedPrisma.favorite.findMany).toHaveBeenCalledWith({
        where: { clientId },
        select: {
          mover: {
            select: {
              id: true,
              nickName: true,
              profileImage: true,
              averageReviewRating: true,
              reviewCount: true,
              career: true,
              estimateCount: true,
              favoriteCount: true,
              serviceType: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { mover: { favoriteCount: "desc" } },
      });
      expect(mockedPrisma.favorite.count).toHaveBeenCalledWith({ where: { clientId } });

      expect(result.movers).toHaveLength(fakeFavorites.length);
      expect(result.movers[0]).toMatchObject({ id: "mover1", isLiked: true });
      expect(result.pagination).toEqual({
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    });

    test("prisma 호출 시 에러가 발생하면 ServerError를 던져야 한다", async () => {
      // Setup
      const clientId = "client-uuid";
      const offset = 0;
      const limit = 2;
      const page = 1;

      const nativeError = new Error("DB error");
      (mockedPrisma.favorite.findMany as jest.Mock).mockRejectedValue(nativeError);

      // Exercise & Assertion
      await expect(
        favoriteRepository.findFavoriteMoverByClientId(clientId, offset, limit, page),
      ).rejects.toThrow("찜한 기사님 목록 조회 중 서버 오류가 발생했습니다.");
    });
  });
});
