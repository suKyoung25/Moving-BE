import { Router } from "express";
import reviewController from "../controllers/review.controller";
import { validateReq } from "../middlewares/auth.middleware";
import { CreateReviewSchema, UpdateReviewschema } from "../dtos/review.dto";

const reviewRouter = Router();

// 내가 작성한 리뷰 목록
reviewRouter.get("/me", reviewController.getMyReviews);

// 리뷰 작성
reviewRouter.post("/", validateReq(CreateReviewSchema), reviewController.createReview);

// 리뷰 수정
reviewRouter.patch("/:reviewId", validateReq(UpdateReviewschema), reviewController.updateReview);

// 리뷰 삭제
reviewRouter.delete("/:reviewId", reviewController.deleteReview);

// 작성 가능한 리뷰 목록
reviewRouter.get("/writable", reviewController.getWritableReviews);

export default reviewRouter;
