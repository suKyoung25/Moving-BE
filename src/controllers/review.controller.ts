import { NextFunction, Request, Response } from "express";
import reviewService from "../services/review.service";
import {
  CreateReviewDto,
  CreateReviewSchema,
  UpdateReviewDto,
  UpdateReviewschema,
} from "../dtos/review.dto";
import { Review } from "@prisma/client";

// 내가 작성한 리뷰 목록
async function getMyReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    const result = await reviewService.getMyReviews(clientId, page, limit);
    res.status(200).json({ message: "리뷰 목록 조회 성공", data: result });
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
    const { estimateId, rating, content } = req.body;
    const parsedRating = Number(rating);
    const review = await reviewService.createReview(
      { estimateId, rating: parsedRating, content },
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

    res.status(204).end();
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
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  getWritableReviews,
};
