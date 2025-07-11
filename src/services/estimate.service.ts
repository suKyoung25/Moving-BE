import { Client } from "@prisma/client";
import estimateRepository from "../repositories/estimate.repository";
import { BadRequestError } from "../types/errors";
import { CreateRequestDto } from "../dtos/estimate.dto";

// 작성 가능한 리뷰 목록
async function getWritableEstimates(clientId: Client["id"], page: number, pageSize: number) {
  if (!clientId) {
    throw new BadRequestError("clientId가 필요합니다.");
  }
  const skip = (page - 1) * pageSize;
  return estimateRepository.findWritableEstimatesByClientId(clientId, skip, pageSize);
}

// 견적 요청 생성 //에러떠서 일단 주석 처리함
async function createEstimateRequest({
  request,
  clientId,
}: {
  request: CreateRequestDto;
  clientId: string;
}) {
  return await estimateRepository.createRequest(request, clientId);
}

export default {
  getWritableEstimates,
  createEstimateRequest,
};
