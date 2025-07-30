import prisma from "@/configs/prisma.config";
import { Client, Prisma, Review, Mover, Estimate } from "@prisma/client";

// 내가 작성한 리뷰 목록 (페이징 포함)
async function findReviewsByClientId(clientId: Client["id"], offset: number, limit: number) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { clientId },
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        moverId: true,
        mover: { select: { nickName: true, profileImage: true } },
        estimate: {
          select: {
            price: true,
            request: {
              select: {
                moveType: true,
                moveDate: true,
                designatedRequest: { select: { moverId: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.review.count({ where: { clientId } }),
  ]);

  return { reviews, total };
}

// 기사님에게 달린 리뷰 목록 조회 (페이징 포함)
async function findReviewsByMoverId(moverId: string, offset: number, limit: number) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { moverId },
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        client: {
          select: {
            name: true,
          },
        },
        estimate: {
          select: {
            price: true,
            request: {
              select: {
                moveType: true,
                moveDate: true,
                designatedRequest: { select: { moverId: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.review.count({ where: { moverId } }),
  ]);

  return { reviews, total };
}

// mover 리뷰 평점 및 개수 통계 업데이트 (트랜잭션 내부에서 호출)
async function updateMoverReviewStatsTx(moverId: Mover["id"], tx: Prisma.TransactionClient) {
  const stats = await tx.review.aggregate({
    where: { moverId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await tx.mover.update({
    where: { id: moverId },
    data: {
      averageReviewRating: stats._avg.rating ?? 0,
      reviewCount: stats._count.rating,
    },
  });
}

// 리뷰 생성
async function createReviewTx(tx: Prisma.TransactionClient, data: Prisma.ReviewCreateInput) {
  return tx.review.create({ data });
}

// estimateId로 리뷰 조회
async function findReviewByEstimateId(estimateId: Estimate["id"]) {
  return prisma.review.findUnique({ where: { estimateId } });
}

// reviewId로 리뷰 조회
async function findReviewById(reviewId: Review["id"]) {
  return prisma.review.findUnique({ where: { id: reviewId } });
}

// 리뷰 업데이트
async function updateReviewTx(
  tx: Prisma.TransactionClient,
  reviewId: Review["id"],
  data: Partial<Pick<Review, "rating" | "content">>,
) {
  return tx.review.update({
    where: { id: reviewId },
    data,
  });
}

// 리뷰 삭제
async function deleteReviewTx(tx: Prisma.TransactionClient, reviewId: Review["id"]) {
  return tx.review.delete({ where: { id: reviewId } });
}

export default {
  findReviewsByClientId,
  findReviewsByMoverId,
  updateMoverReviewStatsTx,
  createReviewTx,
  findReviewByEstimateId,
  findReviewById,
  updateReviewTx,
  deleteReviewTx,
};
