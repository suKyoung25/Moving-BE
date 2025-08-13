import { NextFunction, Request, Response } from "express";
import { Review } from "@prisma/client";
import reviewService from "../services/review.service";
import { CreateReviewDto, UpdateReviewDto } from "../dtos/review.dto";

// 공통 페이징 헬퍼 함수
function getPaginationParams(req: Request) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  return { page, limit };
}

// 리뷰 목록 조회 (내가 작성한 리뷰 + 특정 기사님 리뷰)
async function getReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { moverId } = req.params;
    const { page, limit } = getPaginationParams(req);

    let result;
    let message;

    if (moverId) {
      // 특정 기사님 리뷰 조회 (공개용)
      result = await reviewService.getMoverReviews(moverId, page, limit);
      message = "기사님 리뷰 목록 조회 성공";
    } else {
      // 내가 작성한 리뷰 조회 (기본값)
      const clientId = req.auth!.userId;
      result = await reviewService.getMyReviews(clientId, page, limit);
      message = "내가 작성한 리뷰 목록 조회 성공";
    }

    res.status(200).json({ message, data: result });
  } catch (error) {
    next(error);
  }
}

// 기사님 본인에게 달린 리뷰 조회 전용 함수
async function getMoverOwnReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth!.userId; // 기사님 본인의 ID
    const { page, limit } = getPaginationParams(req);

    const result = await reviewService.getMoverReviews(moverId, page, limit);
    res.status(200).json({
      message: "기사님에게 달린 리뷰 목록 조회 성공",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
// 리뷰 작성
async function createReview(
  req: Request<{}, {}, CreateReviewDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const clientId = req.auth!.userId;
    const { estimateId, rating, content, images } = req.body;
    const parsedRating = Number(rating);
    const review = await reviewService.createReview(
      { estimateId, rating: parsedRating, content, images },
      clientId,
    );

    res.status(201).json({ message: "리뷰 작성 성공", data: review });
  } catch (error) {
    next(error);
  }
}

// 리뷰 수정
async function updateReview(
  req: Request<{ reviewId: Review["id"] }, {}, UpdateReviewDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const clientId = req.auth!.userId;
    const { reviewId } = req.params;
    const { rating, content } = req.body;
    const updated = await reviewService.updateReview(reviewId, clientId, {
      rating,
      content,
    });

    res.status(200).json({ message: "리뷰 수정 성공", data: updated });
  } catch (error) {
    next(error);
  }
}

// 리뷰 삭제
async function deleteReview(
  req: Request<{ reviewId: Review["id"] }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const clientId = req.auth!.userId;
    const { reviewId } = req.params;
    await reviewService.deleteReview(reviewId, clientId);

    res.status(200).json({ message: "리뷰 삭제 성공" });
  } catch (error) {
    next(error);
  }
}

// 작성 가능한 리뷰 목록
async function getWritableReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    const result = await reviewService.getWritableReviews(clientId, page, limit);
    res.status(200).json({
      message: "작성 가능한 리뷰 견적 목록 조회 성공",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getWritableReviews,
  getMoverOwnReviews,
};
