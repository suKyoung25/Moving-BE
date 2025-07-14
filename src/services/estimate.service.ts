import { Client } from "@prisma/client";
import estimateRepository from "../repositories/estimate.repository";
import { BadRequestError } from "../types/errors";
import { CreateRequestDto } from "../dtos/estimate.dto";

// 작성 가능한 리뷰 목록
async function getWritableEstimates(clientId: Client["id"]) {
  if (!clientId) {
    throw new BadRequestError("clientId가 필요합니다.");
  }
  return estimateRepository.findWritableEstimatesByClientId(clientId);
}

// 견적 요청 생성
async function createEstimateRequest({
  request,
  clientId,
}: {
  request: CreateRequestDto;
  clientId: string;
}) {
  return await estimateRepository.createRequest(request, clientId);
}

// 데기 중인 견적서 조회
async function getPendingEstimate(clientId: Client["id"]) {
  const estimates = await estimateRepository.getPendingEstimatesByClientId(clientId);

  const enrichedEstimates = await Promise.all(
    estimates.map(async (estimate) => {
      const isFavorite = estimate.moverId
        ? await estimateRepository.isFavoritMover(clientId, estimate.moverId)
        : false;

      return {
        ...estimate,
        isFavorite,
      };
    }),
  );
  return enrichedEstimates;
}

export default {
  getWritableEstimates,
  createEstimateRequest,
  getPendingEstimate,
};
