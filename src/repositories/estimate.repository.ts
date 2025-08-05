import prisma from "../configs/prisma.config";
import { ServerError } from "../types";
import { Client, Estimate, EstimateStatus, Mover, Prisma } from "@prisma/client";

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
            designatedRequests: {
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
async function findPendingEstimatesByClientId(clientId: Client["id"], offset = 0, limit = 6) {
  const estimates = await prisma.estimate.findMany({
    where: {
      moverStatus: "CONFIRMED",
      isClientConfirmed: false,
      request: {
        clientId,
        isPending: true,
      },
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
      request: {
        select: {
          id: true,
          moveDate: true,
          fromAddress: true,
          toAddress: true,
          moveType: true,
          designatedRequests: {
            select: {
              moverId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: offset,
    take: limit,
  });

  const totalCount = await prisma.estimate.count({
    where: {
      moverStatus: "CONFIRMED",
      isClientConfirmed: false,
      request: {
        clientId,
        isPending: true,
      },
    },
  });

  return { estimates, totalCount };
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
async function findReceivedEstimatesByClientId(
  clientId: string,
  page: number,
  limit: number,
  category: "all" | "confirmed",
) {
  const skip = (page - 1) * limit;

  const whereClause =
    category === "confirmed"
      ? {
          clientId,
          moverStatus: EstimateStatus.CONFIRMED,
          isClientConfirmed: true,
          request: {
            isPending: false,
          },
        }
      : {
          clientId,
          moverStatus: EstimateStatus.CONFIRMED,
          request: {
            isPending: false,
          },
        };

  const [estimates, totalCount] = await Promise.all([
    prisma.estimate.findMany({
      where: whereClause,
      include: {
        mover: true,
        request: {
          include: {
            designatedRequests: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.estimate.count({
      where: whereClause,
    }),
  ]);

  return { estimates, totalCount };
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
            designatedRequests: true,
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

// 반려한 견적 조회
const PAGE_SIZE = 6;

async function getRejectedEstimates(moverId: string, page: number) {
  const skip = (page - 1) * PAGE_SIZE;

  const [totalCount, estimates] = await Promise.all([
    prisma.estimate.count({
      where: {
        moverId,
        moverStatus: "REJECTED",
      },
    }),
    prisma.estimate.findMany({
      where: {
        moverId,
        moverStatus: "REJECTED",
      },
      select: {
        id: true,
        price: true,
        comment: true,
        createdAt: true,
        isClientConfirmed: true,
        moverId: true,
        request: {
          select: {
            moveDate: true,
            fromAddress: true,
            toAddress: true,
            moveType: true,
            client: {
              select: { name: true },
            },
            designatedRequests: {
              select: { moverId: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    estimates,
  };
}

// 보낸 견적 조회
async function getPaginatedSentEstimates(moverId: string, page: number) {
  const skip = (page - 1) * PAGE_SIZE;

  const [totalCount, estimates] = await Promise.all([
    prisma.estimate.count({
      where: {
        moverId,
        moverStatus: "CONFIRMED",
      },
    }),
    prisma.estimate.findMany({
      where: {
        moverId,
        moverStatus: "CONFIRMED",
      },
      select: {
        id: true,
        price: true,
        comment: true,
        createdAt: true,
        isClientConfirmed: true,
        moverId: true,
        request: {
          select: {
            moveDate: true,
            fromAddress: true,
            toAddress: true,
            moveType: true,
            client: {
              select: { name: true },
            },
            designatedRequests: {
              select: { moverId: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    estimates,
  };
}

// 견적 취소하기
async function findById(id: string) {
  return prisma.estimate.findUnique({
    where: { id },
    select: {
      id: true,
      moverId: true,
      moverStatus: true,
      isClientConfirmed: true,
    },
  });
}

async function deleteById(id: string) {
  return prisma.estimate.delete({
    where: { id },
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
  getRejectedEstimates,
  getPaginatedSentEstimates,
  findById,
  deleteById,
};
