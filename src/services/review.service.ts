import { Client, Review } from "@prisma/client";
import reviewRepository from "../repositories/review.repository";
import { BadRequestError, ForbiddenError, NotFoundError } from "../types/errors";
import { CreateReviewDto } from "../dtos/review.dto";
import estimateRepository from "../repositories/estimate.repository";

// 내가 작성한 리뷰 목록
async function getMyReviews(clientId: Client["id"], page: number = 1, limit: number = 6) {
  const offset = (page - 1) * limit;
  return reviewRepository.findReviewsByClientId(clientId, offset, limit, page);
}

// 리뷰 작성
async function createReview(data: CreateReviewDto, clientId: Client["id"]) {
  const { estimateId, rating, content } = data;

  // 견적에서 moverId 조회
  const estimate = await estimateRepository.getEstimateMoverId(estimateId);
  if (!estimate) throw new BadRequestError("존재하지 않는 견적입니다.");

  return reviewRepository.createReview(
    {
      estimate: { connect: { id: estimateId } },
      client: { connect: { id: clientId } },
      mover: { connect: { id: estimate.moverId } },
      rating,
      content,
    },
    estimate.moverId,
  );
}

// 리뷰 수정
async function updateReview(
  reviewId: Review["id"],
  clientId: Client["id"],
  data: Partial<{ rating: Review["rating"]; content: Review["content"] }>,
) {
  if (!reviewId) throw new BadRequestError("reviewId가 필요합니다.");

  const review = await reviewRepository.findReviewById(reviewId);
  if (!review) throw new NotFoundError("리뷰를 찾을 수 없습니다.");
  if (review.clientId !== clientId) throw new ForbiddenError("수정 권한이 없습니다.");

  return reviewRepository.updateReview(reviewId, data);
}

// 리뷰 삭제
async function deleteReview(reviewId: Review["id"], clientId: Client["id"]) {
  if (!reviewId) throw new BadRequestError("reviewId가 필요합니다.");

  const review = await reviewRepository.findReviewById(reviewId);
  if (!review) throw new NotFoundError("리뷰를 찾을 수 없습니다.");
  if (review.clientId !== clientId) throw new ForbiddenError("삭제 권한이 없습니다.");

  await reviewRepository.deleteReview(reviewId);
}

// 작성 가능한 리뷰 목록
async function getWritableReviews(clientId: Client["id"], page: number, limit: number) {
  if (!clientId) {
    throw new BadRequestError("clientId가 필요합니다.");
  }
  const offset = (page - 1) * limit;
  return estimateRepository.findWritableEstimatesByClientId(clientId, offset, limit, page);
}

export default {
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  getWritableReviews,
};
