import { Client, Mover } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { NotFoundError, ServerError } from "../types/errors";
import { CreateRequestDto } from "../dtos/estimate.dto";

// 작성 가능한 리뷰 목록
async function findWritableEstimatesByClientId(clientId: Client["id"], skip: number, take: number) {
  try {
    const [estimates, total] = await Promise.all([
      prisma.estimate.findMany({
        where: {
          clientId,
          request: { moveDate: { lte: new Date() } },
          review: null,
        },
        select: {
          id: true,
          price: true,
          request: {
            select: {
              moveType: true,
              // isDesignated: true,
              moveDate: true,
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
        skip,
        take,
      }),
      prisma.estimate.count({
        where: {
          clientId,
          request: { moveDate: { lte: new Date() } },
          review: null,
        },
      }),
    ]);

    if (estimates.length === 0) {
      throw new NotFoundError("작성 가능한 리뷰가 없습니다.");
    }

    return {
      estimates,
      total,
      pagination: {
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  } catch (error) {
    throw new ServerError("작성 가능한 리뷰 조회 중 서버 오류가 발생했습니다.", error);
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

export default {
  findWritableEstimatesByClientId,
  findPendingEstimatesByClientId,
  isFavoritMover,
};
