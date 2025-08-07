import prisma from "../configs/prisma.config";
import { CreateRequestDto } from "../dtos/request.dto";
import {
  BadRequestError,
  ConflictError,
  GetClientRequestsInput,
  GetFilteredRequestsInput,
  NotFoundError,
  ServerError,
} from "../types";
import { Prisma, RequestDraft } from "@prisma/client";

const now = new Date();
const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

// 견적 요청 중간 상태 조회
async function getRequestDraftById(clientId: string) {
  return await prisma.requestDraft.findUnique({
    where: { clientId },
  });
}

// 견적 요청 중간 상태 저장
async function saveRequestDraft(clientId: string, data: Partial<RequestDraft>) {
  return await prisma.requestDraft.upsert({
    where: { clientId },
    update: {
      ...data,
      updatedAt: new Date(),
    },
    create: {
      clientId,
      ...data,
    },
  });
}

// 견적 요청 상세 조회
async function findRequest(requestId: string) {
  return await prisma.request.findUnique({
    where: { id: requestId },
  });
}

// 보낸 견적 요청 상세 조회 (일반 유저)
async function findRequestDetailByClientId(clientId: string, requestId: string) {
  return await prisma.request.findUnique({
    where: {
      id: requestId,
      clientId,
    },
  });
}

// 보낸 견적 요청 목록 조회 (일반 유저)
async function getRequestsByClientId({
  clientId,
  limit,
  cursor,
  sort = "desc",
}: GetClientRequestsInput) {
  const take = Number(limit) || 6;

  const result = await prisma.request.findMany({
    where: { clientId },
    include: {
      estimates: true,
    },
    take: take + 1,
    orderBy: { requestedAt: sort },
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const hasNextPage = result.length > take;
  const requests = hasNextPage ? result.slice(0, take) : result;

  return {
    requests,
    nextCursor: hasNextPage ? requests[requests.length - 1].id : null,
  };
}

// 견적 요청 (일반 유저)
async function createEstimateRequest(request: CreateRequestDto, clientId: string) {
  const result = await prisma.request.create({
    data: {
      ...request,
      client: {
        connect: {
          id: clientId,
        },
      },
    },
  });

  // 요청 완료되면 draft 제거
  await prisma.requestDraft.delete({
    where: { clientId },
  });

  return result;
}

// 견적 요청 취소 (일반 유저)
async function deleteEstimateRequest(requestId: string) {
  return await prisma.request.delete({
    where: { id: requestId },
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
        estimates: {
          some: {
            moverId,
          },
        },
      },
      {
        estimates: {
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
      designatedRequests: {
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

  const totalCount = await prisma.request.count({ where });

  const args = {
    where,
    orderBy,
    take: limit ?? 6,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    include: {
      designatedRequests: true,
      client: {
        select: {
          name: true,
        },
      },
    },
  } satisfies Prisma.RequestFindManyArgs;

  type RequestWithIncludes = Prisma.RequestGetPayload<typeof args>;

  const requests: RequestWithIncludes[] = await prisma.request.findMany(args);

  const result = requests.map(({ designatedRequests, client, ...rest }) => ({
    ...rest,
    isDesignated: designatedRequests.map((dr) => dr.moverId).includes(moverId),
    clientName: client.name,
  }));

  const nextCursor = requests.length === limit ? requests[requests.length - 1].id : null;

  return {
    result,
    nextCursor,
    totalCount,
  };
}

// 활성 견적 요청 조회
async function findPendingRequestById(clientId: string) {
  return await prisma.request.findFirst({
    where: {
      clientId,
      moveDate: {
        gte: new Date(),
      },
    },
  });
}

// 지정 견적 요청
async function designateMover(requestId: string, moverId: string, clientId?: string) {
  try {
    // 1. 요청 존재 여부 및 권한 확인
    let request;
    if (clientId) {
      // clientId가 있으면 권한 체크
      request = await prisma.request.findFirst({
        where: {
          id: requestId,
          clientId: clientId,
          isPending: true,
        },
        select: { id: true, isPending: true, clientId: true },
      });

      if (!request) {
        throw new NotFoundError("본인의 진행 중인 요청만 지정 견적을 요청할 수 있습니다.");
      }
    } else {
      // clientId가 없으면 기본 확인만
      request = await prisma.request.findUnique({
        where: { id: requestId },
        select: { id: true, isPending: true },
      });

      if (!request) {
        throw new NotFoundError("요청을 찾을 수 없습니다.");
      }

      if (!request.isPending) {
        throw new BadRequestError("이미 완료된 요청입니다.");
      }
    }

    // 2. 기사 존재 여부 확인
    const mover = await prisma.mover.findUnique({
      where: { id: moverId },
      select: { id: true, nickName: true },
    });

    if (!mover) {
      throw new NotFoundError("기사님을 찾을 수 없습니다.");
    }

    // 3. 이미 지정 요청한 기사인지 확인
    const existingDesignation = await prisma.designatedRequest.findUnique({
      where: {
        requestId_moverId: {
          requestId,
          moverId,
        },
      },
    });

    if (existingDesignation) {
      throw new ConflictError("이미 지정 견적을 요청한 기사님입니다.");
    }

    // 4. 지정 견적 요청 생성
    const designatedRequest = await prisma.designatedRequest.create({
      data: {
        requestId,
        moverId,
      },
    });

    return designatedRequest;
  } catch (error: unknown) {
    console.error(`지정 견적 요청 오류:`, error);

    // Prisma 중복 키 오류 처리
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      throw new ConflictError("이미 지정 견적을 요청한 기사님입니다.");
    }

    // 커스텀 에러 다시 던지기
    if (
      error instanceof NotFoundError ||
      error instanceof ConflictError ||
      error instanceof BadRequestError
    ) {
      throw error;
    }

    throw new ServerError("지정 견적 요청 중 오류가 발생했습니다.", error);
  }
}

// 받은 요청 상세 조회(기사님)
async function findRequestDetailById(id: string, currentMoverId: string) {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          name: true,
        },
      },
      designatedRequests: {
        select: {
          moverId: true,
        },
      },
    },
  });

  if (!request) return null;

  const isDesignated = request.designatedRequests.some((dr) => dr.moverId === currentMoverId);

  const { designatedRequests, ...rest } = request;
  return {
    ...rest,
    isDesignated,
  };
}
export default {
  getRequestDraftById,
  saveRequestDraft,
  getRequestsByClientId,
  createEstimateRequest,
  deleteEstimateRequest,
  getFilteredRequests,
  findPendingRequestById,
  designateMover,
  findRequest,
  findRequestDetailById,
  findRequestDetailByClientId,
};
