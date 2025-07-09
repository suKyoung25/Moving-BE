import { NextFunction, Request, Response } from "express";
import reviewService from "../services/review.service";
import {
  CreateReviewDto,
  ReviewIdParamsDto,
  UpdateReviewDto,
} from "../dtos/review.dto";

// 내가 작성한 리뷰 목록
async function getMyReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth?.userId;
    if (!clientId) {
      res.status(401).json({ message: "인증 정보가 없습니다." });
      return;
    }
    const reviews = await reviewService.getMyReviews(clientId);
    res
      .status(200)
      .json({ status: 200, message: "리뷰 목록 조회 성공", data: reviews });
  } catch (error) {
    next(error);
  }
}

// 리뷰 작성
async function createReview(
  req: Request<{}, {}, CreateReviewDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const clientId = req.auth?.userId;
    if (!clientId) {
      res.status(401).json({ message: "인증 정보가 없습니다." });
      return;
    }
    const { estimateId, rating, content, moverId } = req.body;
    const review = await reviewService.createReview({
      estimateId,
      rating,
      content,
      clientId,
      moverId,
    });

    res
      .status(201)
      .json({ status: 201, message: "리뷰 작성 성공", data: review });
  } catch (error) {
    next(error);
  }
}

// 리뷰 수정
async function updateReview(
  req: Request<ReviewIdParamsDto, {}, UpdateReviewDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const clientId = req.auth?.userId;
    if (!clientId) {
      res.status(401).json({ message: "인증 정보가 없습니다." });
      return;
    }
    const { reviewId } = req.params;
    const { rating, content } = req.body;
    const updated = await reviewService.updateReview(reviewId, clientId, {
      rating,
      content,
    });

    res
      .status(200)
      .json({ status: 200, message: "리뷰 수정 성공", data: updated });
  } catch (error) {
    next(error);
  }
}

// 리뷰 삭제
async function deleteReview(
  req: Request<ReviewIdParamsDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const clientId = req.auth?.userId;
    if (!clientId) {
      res.status(401).json({ message: "인증 정보가 없습니다." });
      return;
    }
    const { reviewId } = req.params;
    await reviewService.deleteReview(reviewId, clientId);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export default {
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
