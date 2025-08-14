import prisma from "../configs/prisma.config";
import { CreateReviewDto } from "../dtos/review.dto";
import estimateRepository from "../repositories/estimate.repository";
import reviewRepository from "../repositories/review.repository";
import { BadRequestError, ForbiddenError, NotFoundError, ValidationError } from "../types";
import { Client, Review } from "@prisma/client";
import { translateData } from "../utils/translation.util";

// 내가 작성한 리뷰 목록 (페이징 포함)
async function getMyReviews(clientId: Client["id"], page = 1, limit = 6, targetLang?: string) {
  if (page < 1) page = 1;
  if (limit < 1) limit = 6;

  const offset = (page - 1) * limit;
  const { reviews, total } = await reviewRepository.findReviewsByClientId(clientId, offset, limit);

  // 결과 매핑
  const mappedReviews = reviews.map((e) => ({
    id: e.id,
    rating: e.rating,
    content: e.content,
    images: e.images,
    createdAt: e.createdAt,
    moverNickName: e.mover.nickName,
    moverProfileImage: e.mover.profileImage,
    price: e.estimate.price,
    moveType: e.estimate.request.moveType,
    moveDate: e.estimate.request.moveDate,
    isDesignatedEstimate:
      Array.isArray(e.estimate.request.designatedRequests) &&
      e.estimate.request.designatedRequests.some((dr) => dr.moverId === e.moverId),
  }));

  const result = {
    reviews: mappedReviews,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return await translateData(result, ["reviews.content"], targetLang) as typeof result;
  }

  return result;
}

async function getMoverReviews(moverId: string, page = 1, limit = 6, targetLang?: string) {
  if (page < 1) page = 1;
  if (limit < 1) limit = 6;

  const offset = (page - 1) * limit;
  const { reviews, total } = await reviewRepository.findReviewsByMoverId(moverId, offset, limit);

  // 결과 매핑
  const mappedReviews = reviews.map((e) => ({
    id: e.id,
    rating: e.rating,
    content: e.content,
    images: e.images,
    createdAt: e.createdAt,
    clientName: e.client.name,
    price: e.estimate.price,
    moveType: e.estimate.request.moveType,
    moveDate: e.estimate.request.moveDate,
    isDesignatedEstimate:
      Array.isArray(e.estimate.request.designatedRequests) &&
      e.estimate.request.designatedRequests.some((dr) => dr.moverId === moverId),
  }));

  const result = {
    reviews: mappedReviews,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return await translateData(result, ["reviews.content"], targetLang) as typeof result;
  }

  return result;
}

// 리뷰 작성
async function createReview(data: CreateReviewDto, clientId: Client["id"]) {
  const { estimateId, rating, content, images } = data;

  // 견적에서 moverId 조회 및 존재 확인
  const estimate = await estimateRepository.getEstimateMoverId(estimateId);
  if (!estimate) throw new BadRequestError("존재하지 않는 견적입니다.");

  // 이미 리뷰 존재 여부 확인
  const existing = await reviewRepository.findReviewByEstimateId(estimateId);
  if (existing) throw new ValidationError("이미 리뷰가 등록된 견적입니다.");

  // 트랜잭션 내에 리뷰 생성
  return await prisma.$transaction(async (tx) => {
    const review = await reviewRepository.createReviewTx(tx, {
      estimate: { connect: { id: estimateId } },
      client: { connect: { id: clientId } },
      mover: { connect: { id: estimate.moverId } },
      rating,
      content,
      images: images ?? [],
    });
    await reviewRepository.updateMoverReviewStatsTx(estimate.moverId, tx);
    return review;
  });
}

// 리뷰 수정
async function updateReview(
  reviewId: Review["id"],
  clientId: Client["id"],
  data: Partial<{ rating: Review["rating"]; content: Review["content"]; images: Review["images"] }>,
) {
  if (!reviewId) throw new BadRequestError("reviewId가 필요합니다.");

  // 리뷰 존재 여부 및 권한 체크
  const review = await reviewRepository.findReviewById(reviewId);
  if (!review) throw new NotFoundError("리뷰를 찾을 수 없습니다.");
  if (review.clientId !== clientId) throw new ForbiddenError("수정 권한이 없습니다.");

  // 트랜잭션으로 리뷰 수정
  return prisma.$transaction(async (tx) => {
    const updated = await reviewRepository.updateReviewTx(tx, reviewId, data);
    await reviewRepository.updateMoverReviewStatsTx(review.moverId, tx);
    return updated;
  });
}

// 리뷰 삭제
async function deleteReview(reviewId: Review["id"], clientId: Client["id"]) {
  if (!reviewId) throw new BadRequestError("reviewId가 필요합니다.");

  // 리뷰 존재 및 권한 확인
  const review = await reviewRepository.findReviewById(reviewId);
  if (!review) throw new NotFoundError("리뷰를 찾을 수 없습니다.");
  if (review.clientId !== clientId) throw new ForbiddenError("삭제 권한이 없습니다.");

  // 트랜잭션으로 삭제
  return prisma.$transaction(async (tx) => {
    await reviewRepository.deleteReviewTx(tx, reviewId);
    await reviewRepository.updateMoverReviewStatsTx(review.moverId, tx);
  });
}

// 작성 가능한 리뷰 목록 조회
async function getWritableReviews(clientId: Client["id"], page = 1, limit = 6) {
  if (page < 1) page = 1;
  if (limit < 1) limit = 6;

  const offset = (page - 1) * limit;

  const { estimates, total } = await estimateRepository.findWritableEstimatesByClientId(
    clientId,
    offset,
    limit,
  );

  // 결과 매핑
  const mappedEstimates = estimates.map((e) => ({
    estimateId: e.id,
    price: e.price,
    moveType: e.request.moveType,
    moveDate: e.request.moveDate,
    isDesignatedEstimate:
      Array.isArray(e.request.designatedRequests) &&
      e.request.designatedRequests.some((dr) => dr.moverId === e.moverId),
    moverProfileImage: e.mover.profileImage,
    moverNickName: e.mover.nickName,
  }));

  return {
    estimates: mappedEstimates,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default {
  getMyReviews,
  getMoverReviews,
  createReview,
  updateReview,
  deleteReview,
  getWritableReviews,
};
