import { Client, Estimate } from "@prisma/client";
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
          request: { moveDate: { lte: new Date() } },
          review: null,
        },
        select: {
          id: true,
          price: true,
          request: {
            select: {
              moveType: true,
              isDesignated: true,
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
        skip: offset,
        take: limit,
      }),
      prisma.estimate.count({
        where: {
          clientId,
          request: { moveDate: { lte: new Date() } },
          review: null,
        },
      }),
    ]);

    return {
      estimates,
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

export default {
  findWritableEstimatesByClientId,
  getEstimateMoverId,
};
