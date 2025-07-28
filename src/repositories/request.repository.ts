import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { CreateRequestDto } from "../dtos/request.dto";
import { GetFilteredRequestsInput } from "../types";

const now = new Date();
const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

// 견적 요청 (일반 유저)
async function createEstimateRequest(request: CreateRequestDto, clientId: string) {
  return await prisma.request.create({
    data: {
      ...request,
      client: {
        connect: {
          id: clientId,
        },
      },
    },
  });
}

// 받은 요청 조회 (기사님)
async function getFilteredRequests({
  moveType,
  serviceAreaList,
  isDesignated,
  keyword,
  sort,
  limit,
  cursor,
  moverId,
}: GetFilteredRequestsInput) {
  const mover = await prisma.mover.findUnique({
    where: { id: moverId },
    select: {
      serviceArea: {
        select: { id: true },
      },
    },
  });

  // 공통 NOT 조건: 내가 이미 응답한 요청이거나, 누군가에게 이미 확정된 요청이면 NOT으로 제외
  const notCondition: Prisma.RequestWhereInput = {
    OR: [
      {
        estimate: {
          some: {
            moverId,
          },
        },
      },
      {
        estimate: {
          some: {
            isClientConfirmed: true,
          },
        },
      },
    ],
  };

  const moverLivingAreaIds = mover?.serviceArea.map((r) => r.id) ?? [];

  let where: Prisma.RequestWhereInput;

  if (isDesignated) {
    // 지정견적 요청만 보기 ON: 지역 조건은 제거, 이사 유형은 유지
    where = {
      moveType: {
        in: moveType,
      },
      designatedRequest: {
        some: {
          moverId,
        },
      },
      ...(keyword && {
        client: {
          name: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      }),
      // 오늘 이후 이사만 가져오기

      moveDate: {
        gte: tomorrow,
      },
      NOT: notCondition,
    };
  } else {
    // 지정견적 요청만 보기 OFF: 지역 조건 포함
    where = {
      moveType: {
        in: moveType,
      },
      client: {
        livingArea: {
          some: {
            id: { in: moverLivingAreaIds },
          },
        },
        ...(keyword && {
          name: {
            contains: keyword,
            mode: "insensitive",
          },
        }),
      },
      ...(serviceAreaList!.length > 0 && {
        OR: serviceAreaList!.flatMap((area) => [
          { fromAddress: { contains: area } },
          { toAddress: { contains: area } },
        ]),
      }),
      // 오늘 이후 이사만 가져오기
      moveDate: {
        gte: tomorrow,
      },
      NOT: notCondition,
    };
  }

  const orderBy: Prisma.RequestOrderByWithRelationInput =
    sort === "moveDate-asc"
      ? { moveDate: "asc" }
      : sort === "moveDate-desc"
      ? { moveDate: "desc" }
      : { moveDate: "asc" };

  const args = {
    where,
    orderBy,
    take: limit ?? 6,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    include: {
      designatedRequest: true,
      client: {
        select: {
          name: true,
        },
      },
    },
  } satisfies Prisma.RequestFindManyArgs;

  type RequestWithIncludes = Prisma.RequestGetPayload<typeof args>;

  const requests: RequestWithIncludes[] = await prisma.request.findMany(args);

  const result = requests.map(({ designatedRequest, client, ...rest }) => ({
    ...rest,
    isDesignated: designatedRequest.map((dr) => dr.moverId).includes(moverId),
    clientName: client.name,
  }));

  const nextCursor = requests.length === limit ? requests[requests.length - 1].id : null;

  return {
    result,
    nextCursor,
  };
}

//받은 요청 조회(일반)
async function fetchClientActiveRequests(clientId: string) {
  return prisma.request.findMany({
    where: {
      clientId,
      isPending: true,
    },
    orderBy: { requestedAt: "desc" },
    select: {
      id: true,
      moveType: true,
      moveDate: true,
      fromAddress: true,
      toAddress: true,
      requestedAt: true,
    },
  });
}

export default {
  createEstimateRequest,
  getFilteredRequests,
  fetchClientActiveRequests,
};
