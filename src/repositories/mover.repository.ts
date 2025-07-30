import prisma from "../configs/prisma.config";
import { ConflictError, MoverDetail, NotFoundError, ServerError, SimplifiedMover } from "../types";

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
    const { page = 1, limit = 10, search, area, serviceType, sortBy = "mostReviewed" } = params;

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
        // NULL 값을 마지막으로 보내고, 숫자값만 내림차순 정렬
        orderBy = [{ career: { sort: "desc", nulls: "last" } }];
        break;
      case "mostBooked":
        orderBy = { estimateCount: "desc" };
        break;
      default:
        orderBy = { reviewCount: "desc" };
    }

    // 전체 개수 조회
    const total = await prisma.mover.count({ where: whereCondition });

    // 데이터 조회
    const movers = await prisma.mover.findMany({
      where: whereCondition,
      include: {
        favorites: clientId ? { where: { clientId }, select: { id: true } } : false,
      },
      orderBy,
      skip,
      take: limit,
    });

    const simplifiedMovers: SimplifiedMover[] = movers.map(({ favorites, ...mover }) => ({
      ...mover,
      isFavorite: Boolean(favorites?.length),
    }));

    const hasMore = skip + limit < total;

    return {
      movers: simplifiedMovers,
      total,
      page,
      limit,
      hasMore,
    };
  } catch (error) {
    throw new ServerError("기사님 리스트 조회 중 오류 발생", error);
  }
}

// 기사님 상세 조회
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

    return {
      ...mover,
      name: mover.name || "",
      phone: mover.phone || "",
      serviceArea: mover.serviceArea.map((r) => r.regionName), // Region 객체 → 문자열 배열
      favoriteCount: mover.favoriteCount || 0, // null → 0
      isFavorite: Boolean(mover.favorites?.length), // 찜 여부만 계산
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

      // TODO: result 사용이 안되는 것 같은데 확인 부탁드립니다
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
