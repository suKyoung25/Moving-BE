import reviewController from "./review.controller";
import reviewService from "../services/review.service";

// reviewService 모킹
jest.mock("../services/review.service");
const mockedReviewService = reviewService as jest.Mocked<typeof reviewService>;

function createMockRes() {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn().mockReturnThis();
  return { status, json } as any;
}

describe("review.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getReviews", () => {
    test("moverId가 있으면 기사님 리뷰 목록을 반환한다", async () => {
      // Setup
      const req: any = { params: { moverId: "m1" }, query: {} };
      const res = createMockRes();
      const next = jest.fn();
      const result = { reviews: [], total: 0, pagination: { page: 1, limit: 6, totalPages: 0 } };
      mockedReviewService.getMoverReviews.mockResolvedValueOnce(result as any);

      // Exercise
      await reviewController.getReviews(req, res, next);

      // Assertion
      expect(mockedReviewService.getMoverReviews).toHaveBeenCalledWith("m1", 1, 6);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "기사님 리뷰 목록 조회 성공",
        data: result,
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("moverId가 없으면 내가 작성한 리뷰 목록을 반환한다", async () => {
      // Setup
      const req: any = { params: {}, query: {}, auth: { userId: "client1" } };
      const res = createMockRes();
      const next = jest.fn();
      const result = { reviews: [], total: 0, pagination: { page: 1, limit: 6, totalPages: 0 } };
      mockedReviewService.getMyReviews.mockResolvedValueOnce(result as any);

      // Exercise
      await reviewController.getReviews(req, res, next);

      // Assertion
      expect(mockedReviewService.getMyReviews).toHaveBeenCalledWith("client1", 1, 6);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "내가 작성한 리뷰 목록 조회 성공",
        data: result,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getMoverOwnReviews", () => {
    test("본인에게 달린 리뷰 목록을 반환한다", async () => {
      // Setup
      const req: any = { query: {}, auth: { userId: "mover1" } };
      const res = createMockRes();
      const next = jest.fn();
      const result = { reviews: [], total: 0, pagination: { page: 1, limit: 6, totalPages: 0 } };
      mockedReviewService.getMoverReviews.mockResolvedValueOnce(result as any);

      // Exercise
      await reviewController.getMoverOwnReviews(req, res, next);

      // Assertion
      expect(mockedReviewService.getMoverReviews).toHaveBeenCalledWith("mover1", 1, 6);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "기사님에게 달린 리뷰 목록 조회 성공",
        data: result,
      });
    });
  });

  describe("createReview", () => {
    test("리뷰를 생성한다", async () => {
      // Setup
      const req: any = {
        body: { estimateId: "e1", rating: "5", content: "good", images: ["u1"] },
        auth: { userId: "client1" },
      };
      const res = createMockRes();
      const next = jest.fn();
      const created = { id: "r1" };
      mockedReviewService.createReview.mockResolvedValueOnce(created as any);

      // Exercise
      await reviewController.createReview(req, res, next);

      // Assertion
      expect(mockedReviewService.createReview).toHaveBeenCalledWith(
        { estimateId: "e1", rating: 5, content: "good", images: ["u1"] },
        "client1",
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "리뷰 작성 성공", data: created });
    });

    test("서비스 에러 시 next로 전달한다", async () => {
      // Setup
      const req: any = {
        body: { estimateId: "e1", rating: 5, content: "x" },
        auth: { userId: "c1" },
      };
      const res = createMockRes();
      const next = jest.fn();
      const error = new Error("fail");
      mockedReviewService.createReview.mockRejectedValueOnce(error);

      // Exercise
      await reviewController.createReview(req, res, next);

      // Assertion
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateReview", () => {
    test("리뷰를 수정한다", async () => {
      // Setup
      const req: any = {
        params: { reviewId: "r1" },
        body: { rating: 4, content: "upd", images: ["u2"] },
        auth: { userId: "client1" },
      };
      const res = createMockRes();
      const next = jest.fn();
      const updated = { id: "r1", rating: 4 };
      mockedReviewService.updateReview.mockResolvedValueOnce(updated as any);

      // Exercise
      await reviewController.updateReview(req, res, next);

      // Assertion
      expect(mockedReviewService.updateReview).toHaveBeenCalledWith("r1", "client1", {
        rating: 4,
        content: "upd",
        images: ["u2"],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "리뷰 수정 성공", data: updated });
    });
  });

  describe("deleteReview", () => {
    test("리뷰를 삭제한다", async () => {
      // Setup
      const req: any = { params: { reviewId: "r1" }, auth: { userId: "client1" } };
      const res = createMockRes();
      const next = jest.fn();
      mockedReviewService.deleteReview.mockResolvedValueOnce(undefined as any);

      // Exercise
      await reviewController.deleteReview(req, res, next);

      // Assertion
      expect(mockedReviewService.deleteReview).toHaveBeenCalledWith("r1", "client1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "리뷰 삭제 성공" });
    });
  });

  describe("getWritableReviews", () => {
    test("작성 가능한 리뷰 목록을 페이지네이션과 함께 반환한다", async () => {
      // Setup
      const req: any = { query: { page: "2", limit: "3" }, auth: { userId: "client1" } };
      const res = createMockRes();
      const next = jest.fn();
      const result = { estimates: [], total: 0, pagination: { page: 2, limit: 3, totalPages: 0 } };
      mockedReviewService.getWritableReviews.mockResolvedValueOnce(result as any);

      // Exercise
      await reviewController.getWritableReviews(req, res, next);

      // Assertion
      expect(mockedReviewService.getWritableReviews).toHaveBeenCalledWith("client1", 2, 3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "작성 가능한 리뷰 견적 목록 조회 성공",
        data: result,
      });
    });
  });
});
