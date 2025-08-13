import reviewController from "../controllers/review.controller";
import { CreateReviewSchema, UpdateReviewschema } from "../dtos/review.dto";
import { validateReq, verifyAccessToken } from "../middlewares/auth.middleware";
import { Router } from "express";
import { translationMiddleware } from "../middlewares/translation.middleware";
import { cacheMiddleware, invalidateCache } from "../middlewares/cache.middleware";

const reviewRouter = Router();

// 내가 작성한 리뷰 목록
reviewRouter.get(
  "/me",
  verifyAccessToken,
  translationMiddleware(["data.reviews.content"]),
  cacheMiddleware(),
  reviewController.getReviews,
);

// 기사님 본인 리뷰 목록
reviewRouter.get(
  "/mover",
  verifyAccessToken,
  translationMiddleware(["data.reviews.content"]),
  cacheMiddleware(),
  reviewController.getMoverOwnReviews,
);

// 특정 기사님에게 달린 리뷰 목록 (공개용)
reviewRouter.get(
  "/mover/:moverId",
  translationMiddleware(["data.reviews.content"]),
  cacheMiddleware(),
  reviewController.getReviews,
);

// 리뷰 작성
reviewRouter.post(
  "/",
  verifyAccessToken,
  validateReq(CreateReviewSchema),
  invalidateCache(),
  reviewController.createReview,
);

// 리뷰 수정
reviewRouter.patch(
  "/:reviewId",
  verifyAccessToken,
  validateReq(UpdateReviewschema),
  invalidateCache(),
  reviewController.updateReview,
);

// 리뷰 삭제
reviewRouter.delete(
  "/:reviewId",
  verifyAccessToken,
  invalidateCache(),
  reviewController.deleteReview,
);

// 작성 가능한 리뷰 목록
reviewRouter.get(
  "/writable",
  verifyAccessToken,
  cacheMiddleware(),
  reviewController.getWritableReviews,
);

export default reviewRouter;
