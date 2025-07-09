import { Client, Review } from "@prisma/client";
import reviewRepository from "../repositories/review.repository";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../types/errors";
import { CreateReviewBody } from "../types";

// 내가 작성한 리뷰 목록
async function getMyReviews(clientId: Client["id"]) {
  if (!clientId) {
    throw new BadRequestError("clientId가 필요합니다.");
  }
  return reviewRepository.findReviewsByClientId(clientId);
}

// 리뷰 작성
async function createReview(data: CreateReviewBody) {
  const { estimateId, rating, content, clientId, moverId } = data;
  if (!estimateId || !content || !clientId || !moverId) {
    throw new BadRequestError("필수 입력값이 누락되었습니다.");
  }
  if (rating < 1 || rating > 5) {
    throw new BadRequestError("평점은 1~5 사이여야 합니다.");
  }

  return reviewRepository.createReview({
    estimate: { connect: { id: estimateId } },
    client: { connect: { id: clientId } },
    mover: { connect: { id: moverId } },
    rating,
    content,
  });
}

// 리뷰 수정
async function updateReview(
  reviewId: Review["id"],
  clientId: Client["id"],
  updateDto: Partial<{ rating: Review["rating"]; content: Review["content"] }>
) {
  if (!reviewId) throw new BadRequestError("reviewId가 필요합니다.");
  if (!updateDto.rating && !updateDto.content)
    throw new BadRequestError("수정할 내용이 없습니다.");

  const review = await reviewRepository.findReviewById(reviewId);
  if (!review) throw new NotFoundError("리뷰를 찾을 수 없습니다.");
  if (review.clientId !== clientId)
    throw new ForbiddenError("수정 권한이 없습니다.");

  return reviewRepository.updateReview(reviewId, updateDto);
}

// 리뷰 삭제
async function deleteReview(reviewId: Review["id"], clientId: Client["id"]) {
  if (!reviewId) throw new BadRequestError("reviewId가 필요합니다.");

  const review = await reviewRepository.findReviewById(reviewId);
  if (!review) throw new NotFoundError("리뷰를 찾을 수 없습니다.");
  if (review.clientId !== clientId)
    throw new ForbiddenError("삭제 권한이 없습니다.");

  await reviewRepository.deleteReview(reviewId);
}

export default {
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
