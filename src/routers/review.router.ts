import { Router } from "express";
import reviewController from "../controllers/review.controller";

const reviewRouter = Router();

// 내가 작성한 리뷰 목록
reviewRouter.get("/me", reviewController.getMyReviews);
// 리뷰 작성
reviewRouter.post("/", reviewController.createReview);
// 리뷰 수정
reviewRouter.patch("/:reviewId", reviewController.updateReview);
// 리뷰 삭제
reviewRouter.delete("/:reviewId", reviewController.deleteReview);

export default reviewRouter;
