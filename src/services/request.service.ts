import { MoveType, RequestDraft } from "@prisma/client";
import { CreateRequestDto } from "../dtos/request.dto";
import requestRepository from "../repositories/request.repository";
import { GetReceivedRequestsQuery } from "../types";
import { BadRequestError, NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import notificationService from "./notification.service";

// 견적 요청 중간 상태 조회
async function getDraft(clientId: string) {
  const draft = await requestRepository.getRequestDraftById(clientId);
  if (!draft) {
    throw new NotFoundError(ErrorMessage.DRAFT_NOT_FOUND);
  }
  return draft;
}

// 견적 요청 중간 상태 저장
async function saveDraft(clientId: string, data: Partial<RequestDraft>) {
  return await requestRepository.saveRequestDraft(clientId, data);
}

// 견적 요청 (일반 유저)
async function createRequest({
  request,
  clientId,
}: {
  request: CreateRequestDto;
  clientId: string;
}) {
  const newRequest = await requestRepository.createEstimateRequest(request, clientId);

  // 견적 요청한 유저 이름 조회
  const client = await authClientRepository.findById(clientId);

  // 새로운 견적 요청 알림 (to 기사)
  await notificationService.notifyEstimateRequest({
    clientName: client!.name!,
    fromAddress: request.fromAddress,
    toAddress: request.toAddress,
    moveType: request.moveType,
    type: "NEW_ESTIMATE",
    targetId: newRequest.id,
    targetUrl: `/my-quotes/mover/${newRequest.id}`,
  });

  return newRequest;
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

// 활성 견적 요청 조회 (일반)
async function getClientActiveRequests(clientId: string) {
  if (!clientId) throw new BadRequestError("clientId가 필요합니다.");
  return requestRepository.fetchClientActiveRequests(clientId);
}

// 기사 지정
async function designateMover(clientId: string, requestId: string, moverId: string) {
  if (!clientId || !requestId || !moverId) {
    throw new BadRequestError("필수 값 누락");
  }

  return requestRepository.designateMover(requestId, moverId, clientId);
}

export default {
  getDraft,
  saveDraft,
  createRequest,
  getReceivedRequests,
  getClientActiveRequests,
  designateMover,
};
