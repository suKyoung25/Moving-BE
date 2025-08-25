import { CreateRequestDto } from "../dtos/request.dto";
import authClientRepository from "../repositories/authClient.repository";
import requestRepository from "../repositories/request.repository";
import { MoveType, RequestDraft } from "@prisma/client";
import notificationService from "./notification.service";
import {
  BadRequestError,
  ForbiddenError,
  GetClientRequestsInput,
  GetReceivedRequestsQuery,
  NotFoundError,
} from "../types";
import { ErrorMessage } from "../constants/ErrorMessage";
import { translateData } from "../utils/translation.util";

// 견적 요청 중간 상태 조회
async function getDraft(clientId: string, targetLang?: string) {
  const result = await requestRepository.getRequestDraftById(clientId);

  // 번역이 필요한 경우 번역 수행
  if (targetLang && result) {
    return (await translateData(
      result,
      ["data.fromAddress", "data.toAddress"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

// 견적 요청 중간 상태 저장
async function saveDraft(clientId: string, data: Partial<RequestDraft>) {
  return await requestRepository.saveRequestDraft(clientId, data);
}

// 견적 요청 상세 조회
async function getRequest(requestId: string, targetLang?: string) {
  const result = await requestRepository.findRequest(requestId);

  // 번역이 필요한 경우 번역 수행
  if (targetLang && result) {
    return (await translateData(
      result,
      ["data.fromAddress", "data.toAddress"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

// 보낸 견적 요청 조회 (일반 유저) {
async function getRequests(
  { clientId, limit, cursor, sort }: GetClientRequestsInput,
  targetLang?: string,
) {
  const result = await requestRepository.getRequestsByClientId({ clientId, limit, cursor, sort });

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return (await translateData(
      result,
      ["requests.fromAddress", "requests.toAddress", "requests.estimates.comment"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

// 견적 요청 (일반 유저)
async function createRequest({
  request,
  clientId,
}: {
  request: CreateRequestDto;
  clientId: string;
}) {
  // 활성된 견적 요청 있는지 확인
  const existing = await requestRepository.findPendingRequestById(clientId);

  if (existing) {
    throw new BadRequestError(ErrorMessage.ALREADY_EXIST_REQUEST);
  }

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
    targetUrl: `/received-requests/${newRequest.id}`,
  });

  return newRequest;
}

// 견적 요청 취소 (일반 유저)
async function cancelRequest(clientId: string, requestId: string) {
  const request = await requestRepository.findRequestDetailByClientId(clientId, requestId);
  if (!request) {
    throw new NotFoundError(ErrorMessage.REQUEST_NOT_FOUND);
  }
  if (request.clientId !== clientId) {
    throw new ForbiddenError(ErrorMessage.FORBIDDEN);
  }
  if (!request.isPending) {
    throw new BadRequestError(ErrorMessage.FALIED_CANCEL_REQUEST);
  }
  await requestRepository.deleteEstimateRequest(requestId);
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

// 활성 견적 요청 조회 (일반 유저)
async function getClientActiveRequest(clientId: string) {
  if (!clientId) throw new BadRequestError("clientId가 필요합니다.");
  return requestRepository.findPendingRequestById(clientId);
}

// 기사 지정
async function designateMover(clientId: string, requestId: string, moverId: string) {
  if (!clientId || !requestId || !moverId) {
    throw new BadRequestError("필수 값 누락");
  }

  return requestRepository.designateMover(requestId, moverId, clientId);
}

// 받은 요청 상세 조회(기사님)
async function getReceivedRequestDetail(id: string, moverId: string) {
  return await requestRepository.findRequestDetailById(id, moverId);
}

export default {
  getDraft,
  saveDraft,
  getRequest,
  getRequests,
  createRequest,
  cancelRequest,
  getReceivedRequests,
  getClientActiveRequest,
  designateMover,
  getReceivedRequestDetail,
};
