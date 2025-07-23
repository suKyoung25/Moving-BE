import { MoveType } from "@prisma/client";
import { CreateRequestDto, CreateRequestSchema } from "../dtos/request.dto";
import requestRepository from "../repositories/request.repository";
import { GetReceivedRequestsQuery } from "../types";
import { BadRequestError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import notificationService from "./notification.service";

// 견적 요청 (일반 유저)
async function createRequest({
  request,
  clientId,
}: {
  request: CreateRequestDto;
  clientId: string;
}) {
  if (!clientId) {
    throw new BadRequestError(ErrorMessage.BAD_REQUEST);
  }

  const parseResult = CreateRequestSchema.safeParse(request);
  if (!parseResult.success) {
    const errorMessage = parseResult.error.errors[0]?.message ?? ErrorMessage.INVALID_INPUT;
    throw new BadRequestError(errorMessage);
  }

  // 견적 요청한 유저 이름 조회
  const client = await authClientRepository.findById(clientId);

  // 새로운 견적 요청 알림 생성 (to 기사)
  await notificationService.notifyEstimateRequest({
    clientName: client!.name,
    fromAddress: request.fromAddress,
    toAddress: request.toAddress,
    moveType: request.moveType,
    type: "NEW_ESTIMATE",
  });

  return await requestRepository.createEstimateRequest(parseResult.data, clientId);
}

// 받은 요청 조회 (기사님)
async function getReceivedRequests(query: GetReceivedRequestsQuery) {
  const { moveType, isDesignated, serviceArea, keyword, sort, limit = 6, cursor, moverId } = query;

  if (!moverId) {
    throw new BadRequestError(ErrorMessage.BAD_REQUEST);
  }

  const serviceAreaList = serviceArea?.split(",").map((v) => v.trim()) ?? [];

  return await requestRepository.getFilteredRequests({
    moveType: moveType
      ?.split(",")
      .filter((v: string) => ["SMALL", "HOME", "OFFICE"].includes(v)) as MoveType[],
    isDesignated: isDesignated === "true" ? true : isDesignated === "false" ? false : undefined,
    serviceAreaList,
    keyword,
    sort,
    limit: Number(limit),
    cursor,
    moverId,
  });
}

export default {
  createRequest,
  getReceivedRequests,
};
