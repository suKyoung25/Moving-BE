import prisma from "../configs/prisma.config";
import { ConflictError, MoverDetail, NotFoundError, ServerError, SimplifiedMover } from "../types";

interface GetMoversParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
  serviceType?: string;
  sortBy?: string;
  // 위치 기반 검색 파라미터
  latitude?: number;
  longitude?: number;
  radius?: number; // km 단위
}

interface GetMoversResponse {
  movers: SimplifiedMover[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// 전체 기사님 리스트 조회 (페이지네이션 지원)
async function fetchMovers(
  clientId?: string,
  params: GetMoversParams = {},
): Promise<GetMoversResponse> {
  try {
    console.log("🔍 Repository fetchMovers 시작");
    console.log("📝 파라미터:", params);
    const {
      page = 1,
      limit = 10,
      search,
      area,
      serviceType,
      sortBy = "mostReviewed",
      latitude,
      longitude,
      radius = 50, // 기본 50km 반경
    } = params;

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const whereCondition: any = {};

    if (search) {
      whereCondition.OR = [{ nickName: { contains: search, mode: "insensitive" } }];
    }

    if (area && area !== "all") {
      whereCondition.serviceArea = {
        some: {
          regionName: { contains: area, mode: "insensitive" },
        },
      };
    }

    if (serviceType && serviceType !== "all") {
      whereCondition.serviceType = {
        has: serviceType,
      };
    }

    // 위치 기반 검색을 위한 조건 (위도, 경도가 있는 기사님만)
    if (latitude !== undefined && longitude !== undefined) {
      whereCondition.AND = [
        ...(whereCondition.AND || []),
        {
          latitude: { not: null },
          longitude: { not: null },
        },
      ];
    }

    // 정렬 조건 구성
    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case "mostReviewed":
        orderBy = { reviewCount: "desc" };
        break;
      case "highRating":
        orderBy = { averageReviewRating: "desc" };
        break;
      case "highExperience":
        orderBy = [{ career: { sort: "desc", nulls: "last" } }];
        break;
      case "mostBooked":
        orderBy = { estimateCount: "desc" };
        break;
      case "distance":
        // 거리순 정렬은 후처리에서 수행
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { reviewCount: "desc" };
    }

    // 전체 개수 조회
    const total = await prisma.mover.count({ where: whereCondition });

    // 위치 기반 검색을 위해 더 많은 데이터를 가져온 후 필터링
    const fetchLimit = latitude !== undefined && longitude !== undefined ? limit * 3 : limit;
    console.log("🔄 Prisma 쿼리 실행 중...");
    // 수정: 지정견적 정보 포함하여 데이터 조회
    const movers = await prisma.mover.findMany({
      where: whereCondition,
      include: {
        favorites: clientId ? { where: { clientId }, select: { id: true } } : false,
        serviceArea: true,
        // 추가: 지정견적 요청 정보
        designatedRequests: clientId
          ? {
              where: {
                request: {
                  clientId: clientId,
                  isPending: true,
                },
              },
              include: {
                request: {
                  include: {
                    estimates: {
                      where: {
                        moverId: undefined, // 이건 나중에 각 mover에 대해 동적으로 설정
                      },
                      select: {
                        moverStatus: true,
                      },
                    },
                  },
                },
              },
            }
          : false,
      },
      orderBy,
      skip: latitude !== undefined && longitude !== undefined ? 0 : skip,
      take: fetchLimit,
    });

    // 수정: 지정견적 정보 포함한 SimplifiedMover 생성
    let processedMovers: SimplifiedMover[] = await Promise.all(
      movers.map(async ({ favorites, designatedRequests, serviceArea, ...mover }) => {
        let hasDesignatedRequest = false;
        let designatedEstimateStatus = null;

        if (clientId && designatedRequests && designatedRequests.length > 0) {
          hasDesignatedRequest = true;

          // 해당 기사의 견적서 상태 확인
          const estimate = await prisma.estimate.findFirst({
            where: {
              requestId: designatedRequests[0].requestId,
              moverId: mover.id,
            },
            select: {
              moverStatus: true,
            },
          });

          designatedEstimateStatus = estimate?.moverStatus || null;
        }

        // 거리 계산
        let distance: number | undefined;
        if (
          latitude !== undefined &&
          longitude !== undefined &&
          mover.latitude !== null &&
          mover.longitude !== null
        ) {
          distance = calculateDistance(latitude, longitude, mover.latitude, mover.longitude);
        }

        return {
          ...mover,
          serviceArea: serviceArea.map((area) => area.regionName),
          isFavorite: Boolean(favorites?.length),
          hasDesignatedRequest,
          designatedEstimateStatus,
          distance,
        };
      }),
    );

    // 위치 기반 필터링 및 정렬
    if (latitude !== undefined && longitude !== undefined) {
      // 반경 내 기사님만 필터링
      processedMovers = processedMovers.filter(
        (mover) => mover.distance !== undefined && mover.distance <= radius,
      );

      // 거리순 정렬이 요청된 경우
      if (sortBy === "distance") {
        processedMovers.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      // 페이지네이션 적용
      processedMovers = processedMovers.slice(skip, skip + limit);
    }
    console.log("✅ Prisma 쿼리 성공");
    const hasMore =
      latitude !== undefined && longitude !== undefined
        ? processedMovers.length === limit
        : skip + limit < total;

    return {
      movers: processedMovers,
      total: latitude !== undefined && longitude !== undefined ? processedMovers.length : total,
      page,
      limit,
      hasMore,
    };
  } catch (error) {
    console.error("❌ Repository 에러:", error);
    console.error("❌ 에러 타입:", error?.constructor?.name);

    // Prisma 에러 정보
    const prismaError = error as any;
    if (prismaError?.code) {
      console.error("❌ Prisma 에러 코드:", prismaError.code);
      console.error("❌ Prisma 에러 메타:", prismaError.meta);
    }

    throw new ServerError("기사님 리스트 조회 중 오류 발생");
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
      // 위치 정보 포함
      latitude: mover.latitude,
      longitude: mover.longitude,
      businessAddress: mover.businessAddress,
    };
  } catch (error) {
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
