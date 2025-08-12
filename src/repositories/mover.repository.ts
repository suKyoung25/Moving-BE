import prisma from "../configs/prisma.config";
import { ConflictError, MoverDetail, NotFoundError, HttpError, ServerError, SimplifiedMover } from "../types";

interface GetMoversParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
  serviceType?: string;
  sortBy?: string;
}

interface GetMoversResponse {
  movers: SimplifiedMover[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 전체 기사님 리스트 조회 (페이지네이션 지원)
async function fetchMovers(
  clientId?: string,
  params: GetMoversParams = {},
): Promise<GetMoversResponse> {
  try {
    console.log("=== SIMPLE TEST ===");
    
    // 가장 간단한 쿼리만 실행
    const total = await prisma.mover.count();
    console.log("Total movers:", total);
    
    const movers = await prisma.mover.findMany({
      take: 5,
      select: {
        id: true,
        nickName: true,
        email: true,
      }
    });
    console.log("Simple movers:", movers);
    
    // 임시 응답 반환
    return {
      movers: [],
      total: total,
      page: 1,
      limit: 10,
      hasMore: false,
    };
    
  } catch (error) {
    console.error("=== SIMPLE TEST ERROR ===", error);
    throw new ServerError("기사님 리스트 조회 중 오류 발생", error);
  }
}

// 기사님 상세 조회 - 지정견적 정보 포함
async function fetchMoverDetail(moverId: string, clientId?: string): Promise<MoverDetail> {
  try {
    const mover = await prisma.mover.findUnique({
      where: { id: moverId },
      include: {
        favorites: clientId ? { where: { clientId }, select: { id: true } } : false,
        serviceArea: true,
      },
    });

    if (!mover) throw new NotFoundError("기사님을 찾을 수 없습니다.");

    // 추가: 지정견적 정보 조회
    let hasDesignatedRequest = false;
    let designatedEstimateStatus = null;

    if (clientId) {
      const designatedRequest = await prisma.designatedRequest.findFirst({
        where: {
          moverId: moverId,
          request: {
            clientId: clientId,
            isPending: true,
          },
        },
        include: {
          request: true,
        },
      });

      if (designatedRequest) {
        hasDesignatedRequest = true;

        const estimate = await prisma.estimate.findFirst({
          where: {
            requestId: designatedRequest.requestId,
            moverId: moverId,
          },
          select: {
            moverStatus: true,
          },
        });

        designatedEstimateStatus = estimate?.moverStatus || null;
      }
    }

    return {
      ...mover,
      name: mover.name || "",
      phone: mover.phone || "",
      serviceArea: mover.serviceArea.map((r) => r.regionName),
      favoriteCount: mover.favoriteCount || 0,
      isFavorite: Boolean(mover.favorites?.length),
      hasDesignatedRequest,
      designatedEstimateStatus,
    };
  } catch (error) {
    // 이미 HttpError 계열이면 그대로 던진다.
    if (error instanceof HttpError) {
      throw error;
    }
    throw new ServerError("기사님 상세 조회 중 오류 발생", error);
  }
}

// 찜 상태 조회
async function findFavorite(clientId: string, moverId: string) {
  return prisma.favorite.findUnique({
    where: {
      clientId_moverId: {
        clientId,
        moverId,
      },
    },
  });
}

// 찜 토글 (추가/삭제를 한 번에 처리)
async function toggleFavoriteMover(clientId: string, moverId: string) {
  try {
    // 1. 기사 존재 여부 확인
    const mover = await prisma.mover.findUnique({
      where: { id: moverId },
      select: { id: true, favoriteCount: true },
    });

    if (!mover) {
      throw new NotFoundError("기사님을 찾을 수 없습니다.");
    }

    // 2. 현재 찜 상태 확인
    const existingFavorite = await findFavorite(clientId, moverId);

    if (existingFavorite) {
      // 3-a. 이미 찜한 상태 -> 찜 해제
      const result = await prisma.$transaction([
        prisma.favorite.delete({
          where: {
            clientId_moverId: {
              clientId,
              moverId,
            },
          },
        }),
        prisma.mover.update({
          where: { id: moverId },
          data: {
            favoriteCount: {
              decrement: 1,
            },
          },
        }),
      ]);

      return {
        action: "removed" as const,
        isFavorite: false,
        favoriteCount: Math.max(0, (mover.favoriteCount || 0) - 1),
      };
    } else {
      // 3-b. 찜하지 않은 상태 -> 찜 추가

      const result = await prisma.$transaction([
        prisma.favorite.create({
          data: { clientId, moverId },
        }),
        prisma.mover.update({
          where: { id: moverId },
          data: {
            favoriteCount: {
              increment: 1,
            },
          },
        }),
      ]);

      return {
        action: "added" as const,
        isFavorite: true,
        favoriteCount: (mover.favoriteCount || 0) + 1,
      };
    }
  } catch (error: unknown) {
    console.error(`찜 토글 오류:`, error);

    // Prisma 중복 키 오류 처리
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      throw new ConflictError("이미 처리된 요청입니다.");
    }

    // 찾을 수 없음 오류 다시 던지기
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new ServerError("찜 처리 중 오류가 발생했습니다.", error);
  }
}

// 지역 기반 기사 조회
async function findMoversByServiceArea(regions: string[]) {
  return await prisma.mover.findMany({
    where: {
      serviceArea: {
        some: { regionName: { in: regions } },
      },
    },
    select: {
      id: true,
    },
  });
}

export default {
  fetchMovers,
  fetchMoverDetail,
  findFavorite,
  toggleFavoriteMover,
  findMoversByServiceArea,
};
