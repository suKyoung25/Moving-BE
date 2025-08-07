import favoriteService from "./favorite.service";
import favoriteRepository from "../repositories/favorite.repository";
import { BadRequestError } from "../types";
import { MoveType } from "@prisma/client";

jest.mock("../repositories/favorite.repository");
const mockedFavoriteRepository = favoriteRepository as jest.Mocked<typeof favoriteRepository>;

describe("favoriteService", () => {
  // 각 테스트 전 mock 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getFavoriteMovers", () => {
    test("정상적으로 찜한 기사님 목록과 페이지네이션 정보를 반환해야 한다", async () => {
      // Setup
      const clientId = "client-uuid";
      const page = 1;
      const limit = 6;
      const offset = 0;

      const fakeResult = {
        movers: [
          {
            id: "mover1",
            nickName: "MoverNick",
            profileImage: "profile.jpg",
            averageReviewRating: 4.5,
            reviewCount: 10,
            career: 5,
            estimateCount: 20,
            favoriteCount: 100,
            serviceType: [MoveType.HOME, MoveType.OFFICE],
            isLiked: true,
          },
          {
            id: "mover2",
            nickName: "MoverNick2",
            profileImage: "profile2.jpg",
            averageReviewRating: 4.0,
            reviewCount: 6,
            career: 3,
            estimateCount: 12,
            favoriteCount: 50,
            serviceType: [MoveType.SMALL],
            isLiked: true,
          },
        ],
        total: 10,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(10 / limit),
        },
      };

      mockedFavoriteRepository.findFavoriteMoverByClientId.mockResolvedValue(fakeResult);

      // Exercise
      const result = await favoriteService.getFavoriteMovers(clientId, page, limit);

      // Assertion
      expect(mockedFavoriteRepository.findFavoriteMoverByClientId).toHaveBeenCalledWith(
        clientId,
        offset,
        limit,
        page,
      );
      expect(result).toEqual(fakeResult);
    });

    test("clientId 없으면 BadRequestError를 던져야 한다", async () => {
      // Setup
      const clientId = "";

      // Exercise & Assertion
      await expect(favoriteService.getFavoriteMovers(clientId)).rejects.toThrow(BadRequestError);
    });

    test("page, limit가 1 미만이면 기본값으로 보정하여 호출해야 한다", async () => {
      // Setup
      const clientId = "client-uuid";
      const page = 0; // 1 미만
      const limit = 0; // 1 미만

      const fakeResult = {
        movers: [],
        total: 0,
        pagination: {
          page: 1,
          limit: 0,
          totalPages: 0,
        },
      };

      mockedFavoriteRepository.findFavoriteMoverByClientId.mockResolvedValue(fakeResult);

      // Exercise
      const result = await favoriteService.getFavoriteMovers(clientId, page, limit);

      // Assertion
      // offset은 (1-1)*limit = 0으로 바뀌었는지 확인
      expect(mockedFavoriteRepository.findFavoriteMoverByClientId).toHaveBeenCalledWith(
        clientId,
        0,
        6,
        1,
      );
      expect(result).toEqual(fakeResult);
    });
  });
});
