import favoriteController from "./favorite.controller";
import favoriteService from "../services/favorite.service";

// favoriteService 모킹
jest.mock("../services/favorite.service");
const mockedFavoriteService = favoriteService as jest.Mocked<typeof favoriteService>;

function createMockRes() {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn().mockReturnThis();
  return { status, json } as any;
}

describe("favorite.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getFavoriteMovers", () => {
    test("기본 페이지/리밋으로 찜한 기사 목록을 반환한다", async () => {
      // Setup
      const req: any = { query: {}, auth: { userId: "client1" } };
      const res = createMockRes();
      const next = jest.fn();
      const result = { movers: [], total: 0, pagination: { page: 1, limit: 6, totalPages: 0 } };
      mockedFavoriteService.getFavoriteMovers.mockResolvedValueOnce(result as any);

      // Exercise
      await favoriteController.getFavoriteMovers(req, res, next);

      // Assertion
      expect(mockedFavoriteService.getFavoriteMovers).toHaveBeenCalledWith("client1", 1, 6);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "찜한 기사님 목록 조회 성공",
        data: result,
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("쿼리 페이지/리밋이 있으면 반영해서 호출한다", async () => {
      // Setup
      const req: any = { query: { page: "3", limit: "10" }, auth: { userId: "client1" } };
      const res = createMockRes();
      const next = jest.fn();
      const result = { movers: [], total: 0, pagination: { page: 3, limit: 10, totalPages: 0 } };
      mockedFavoriteService.getFavoriteMovers.mockResolvedValueOnce(result as any);

      // Exercise
      await favoriteController.getFavoriteMovers(req, res, next);

      // Assertion
      expect(mockedFavoriteService.getFavoriteMovers).toHaveBeenCalledWith("client1", 3, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "찜한 기사님 목록 조회 성공",
        data: result,
      });
    });

    test("서비스 에러는 next로 전달한다", async () => {
      // Setup
      const req: any = { query: {}, auth: { userId: "client1" } };
      const res = createMockRes();
      const next = jest.fn();
      const error = new Error("fail");
      mockedFavoriteService.getFavoriteMovers.mockRejectedValueOnce(error);

      // Exercise
      await favoriteController.getFavoriteMovers(req, res, next);

      // Assertion
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
