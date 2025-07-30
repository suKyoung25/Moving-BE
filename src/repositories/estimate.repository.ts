import prisma from "../configs/prisma.config";
import { ServerError } from "../types";
import { Client, Estimate, Mover, Prisma } from "@prisma/client";

// 작성 가능한 리뷰 목록
async function findWritableEstimatesByClientId(
  clientId: Client["id"],
  offset: number,
  limit: number,
) {
  const [estimates, total] = await Promise.all([
    prisma.estimate.findMany({
      where: {
        clientId,
        isClientConfirmed: true,
        request: { moveDate: { lte: new Date() } },
        review: null,
      },
      select: {
        id: true,
        price: true,
        moverId: true,
        request: {
          select: {
            moveType: true,
            moveDate: true,
            designatedRequest: {
              select: { moverId: true },
            },
          },
        },
        mover: {
          select: {
            profileImage: true,
            nickName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.estimate.count({
      where: {
        clientId,
        isClientConfirmed: true,
        request: { moveDate: { lte: new Date() } },
        review: null,
      },
    }),
  ]);

  return { estimates, total };
}

async function getEstimateMoverId(estimateId: Estimate["id"]) {
  try {
    return await prisma.estimate.findUnique({
      where: { id: estimateId },
      select: {
        moverId: true,
      },
    });
  } catch (error) {
    throw new ServerError("견적 조회 중 서버 오류가 발생했습니다.", error);
  }
}

// 대기 중인 견적서 조회
async function findPendingEstimatesByClientId(clientId: Client["id"]) {
  try {
    const confirmedRequestIds = await prisma.estimate.findMany({
      where: {
        isClientConfirmed: true,
      },
      select: { requestId: true },
    });

    const excludedRequestIds = confirmedRequestIds.map((e) => e.requestId);

    const estimates = await prisma.request.findMany({
      where: {
        clientId,
        isPending: true,
        id: { notIn: excludedRequestIds },
        estimate: {
          some: {
            moverStatus: "CONFIRMED",
            isClientConfirmed: false,
          },
        },
      },
      include: {
        estimate: {
          where: {
            moverStatus: "CONFIRMED",
            isClientConfirmed: false,
          },
          include: {
            mover: {
              select: {
                id: true,
                name: true,
                nickName: true,
                profileImage: true,
                averageReviewRating: true,
                reviewCount: true,
                favoriteCount: true,
                estimateCount: true,
                career: true,
              },
            },
          },
        },
        designatedRequest: true,
      },
    });

    return estimates;
  } catch (error) {
    throw new ServerError("대기 중인 견적 조회 중 오류 발생", error);
  }
}

// 찜한 기사님 조회
async function isFavoriteMover(clientId: Client["id"], moverId: Mover["id"]) {
  try {
    const favoirte = await prisma.favorite.findUnique({
      where: {
        clientId_moverId: {
          clientId,
          moverId,
        },
      },
    });

    return favoirte;
  } catch (e) {
    throw new ServerError("찜한 기사님을 조회 중 서버 오류가 발생했습니다", e);
  }
}

// 받은 견적 조회
async function findReceivedEstimatesByClientId(clientId: Client["id"]) {
  try {
    const estimates = prisma.request.findMany({
      where: {
        clientId,
        estimate: {
          some: {
            moverStatus: "CONFIRMED",
            isClientConfirmed: true,
          },
        },
      },
      include: {
        estimate: {
          include: { mover: true },
        },
        designatedRequest: true,
      },
    });

    const result = await estimates;
    return result;
  } catch (e) {
    throw new ServerError("받은 견적서 조회 중 서버 오류가 발생했습니다.", e);
  }
}

// 이사날에 해당하는 견적 찾기 (알림)
async function findEstimateByMoveDate(start: Date, end: Date) {
  return await prisma.estimate.findMany({
    where: {
      moverStatus: "CONFIRMED",
      isClientConfirmed: true,
      request: {
        isPending: false,
        moveDate: {
          gte: start,
          lt: end,
        },
      },
    },
    include: {
      request: {
        select: {
          fromAddress: true,
          toAddress: true,
        },
      },
    },
  });
}

// 견적 확정
async function updateEstimateConfirmed(tx: Prisma.TransactionClient, estimateId: string) {
  return tx.estimate.update({
    where: { id: estimateId },
    data: { isClientConfirmed: true },
  });
}

// 기사님 estimateCount +1
async function incrementMoverEstimateCount(tx: Prisma.TransactionClient, moverId: string) {
  return tx.mover.update({
    where: { id: moverId },
    data: { estimateCount: { increment: 1 } },
  });
}

// 견적 단건 조회
async function findEstimateById(tx: Prisma.TransactionClient, estimateId: string) {
  return tx.estimate.findUnique({
    where: { id: estimateId },
    select: {
      isClientConfirmed: true,
      moverId: true,
      clientId: true,
      request: {
        select: { id: true },
      },
    },
  });
}

// request ispending 변경
async function updateRequestPendingFalse(tx: Prisma.TransactionClient, requestId: string) {
  return tx.request.update({
    where: { id: requestId },
    data: { isPending: false },
  });
}

// client 견적 상세 조회
async function findEstimateDetailById(estimateId: string, clientId: string) {
  try {
    const estimate = await prisma.estimate.findFirst({
      where: {
        id: estimateId,
        clientId: clientId,
      },
      include: {
        request: {
          select: {
            id: true,
            moveType: true,
            moveDate: true,
            fromAddress: true,
            toAddress: true,
            requestedAt: true,
            designatedRequest: true,
          },
        },
        mover: {
          select: {
            id: true,
            name: true,
            nickName: true,
            profileImage: true,
            career: true,
            introduction: true,
            description: true,
            averageReviewRating: true,
            reviewCount: true,
            favoriteCount: true,
            estimateCount: true,
          },
        },
      },
    });

    return estimate;
  } catch (e) {
    throw new ServerError("견적 상세 조회 중 서버 오류가 발생했습니다", e);
  }
}

async function findConfirmedEstimate(requestId: string) {
  return await prisma.estimate.findFirst({
    where: {
      requestId,
      isClientConfirmed: true,
    },
  });
}

export default {
  findWritableEstimatesByClientId,
  findPendingEstimatesByClientId,
  isFavoriteMover,
  getEstimateMoverId,
  findReceivedEstimatesByClientId,
  findEstimateByMoveDate,
  updateEstimateConfirmed,
  incrementMoverEstimateCount,
  findEstimateById,
  findEstimateDetailById,
  findConfirmedEstimate,
  updateRequestPendingFalse,
};
