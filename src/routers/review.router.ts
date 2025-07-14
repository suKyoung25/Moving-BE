import { Router } from "express";
import reviewController from "../controllers/review.controller";
import fakeAuth from "../middlewares/fakeAuth";

const reviewRouter = Router();

// 내가 작성한 리뷰 목록
reviewRouter.get("/me", fakeAuth, reviewController.getMyReviews);
// 리뷰 작성
reviewRouter.post("/", fakeAuth, reviewController.createReview);
// 리뷰 수정
reviewRouter.patch("/:reviewId", fakeAuth, reviewController.updateReview);
// 리뷰 삭제
reviewRouter.delete("/:reviewId", fakeAuth, reviewController.deleteReview);

export default reviewRouter;
