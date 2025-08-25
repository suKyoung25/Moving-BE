import prisma from "../configs/prisma.config";
import { ServerError } from "../types";
import { Client } from "@prisma/client";

// 찜한 기사님 목록
async function findFavoriteMoverByClientId(
  clientId: Client["id"],
  offset: number,
  limit: number,
  page: number,
) {
  try {
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { clientId },
        select: {
          mover: {
            select: {
              id: true,
              nickName: true,
              profileImage: true,
              averageReviewRating: true,
              reviewCount: true,
              career: true,
              estimateCount: true,
              favoriteCount: true,
              serviceType: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { mover: { favoriteCount: "desc" } },
      }),
      prisma.favorite.count({ where: { clientId } }),
    ]);

    return {
      movers: favorites.map((f) => ({ ...f.mover, isLiked: true })),
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new ServerError("찜한 기사님 목록 조회 중 서버 오류가 발생했습니다.", error);
  }
}

export default {
  findFavoriteMoverByClientId,
};
