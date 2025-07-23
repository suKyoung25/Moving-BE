import { Client, Estimate, Mover } from "@prisma/client";

import prisma from "../configs/prisma.config";
import { ServerError } from "../types/errors";

// 작성 가능한 리뷰 목록
async function findWritableEstimatesByClientId(
  clientId: Client["id"],
  offset: number,
  limit: number,
  page: number,
) {
  try {
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

    const result = estimates.map((e) => ({
      estimateId: e.id,
      price: e.price,
      moveType: e.request.moveType,
      moveDate: e.request.moveDate,
      isDesignatedEstimate:
        Array.isArray(e.request.designatedRequest) &&
        e.request.designatedRequest.some((dr) => dr.moverId === e.moverId),
      moverProfileImage: e.mover.profileImage,
      moverNickName: e.mover.nickName,
    }));

    return {
      estimates: result,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new ServerError("작성 가능한 리뷰 조회 중 서버 오류가 발생했습니다.", error);
  }
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
    const estimates = prisma.request.findMany({
      where: {
        clientId,
        isPending: true,
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
            mover: true,
          },
        },
        designatedRequest: true,
      },
    });

    const result = await estimates;

    return result;
  } catch (e) {
    throw new ServerError("대기 중인 견적서 조회 중 서버 오류가 발생했습니다", e);
  }
}

// 찜한 기사님 조회
async function isFavoritMover(clientId: Client["id"], moverId: Mover["id"]) {
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
        isPending: false,
        estimate: {
          some: {
            moverStatus: "CONFIRMED",
            isClientConfirmed: true,
          },
        },
      },
      include: {
        estimate: {
          where: {
            moverStatus: "CONFIRMED",
            isClientConfirmed: true,
          },
          include: {
            mover: true,
          },
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
async function findEstimateByMoveDate(date: Date) {
  return await prisma.estimate.findMany({
    where: {
      request: {
        moveDate: date,
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

export default {
  findWritableEstimatesByClientId,
  findPendingEstimatesByClientId,
  isFavoritMover,
  getEstimateMoverId,
  findReceivedEstimatesByClientId,
  findEstimateByMoveDate,
};
