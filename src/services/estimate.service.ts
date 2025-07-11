import { Client } from "@prisma/client";
import estimateRepository from "../repositories/estimate.repository";
import { BadRequestError } from "../types/errors";

// 작성 가능한 리뷰 목록
async function getWritableEstimates(clientId: Client["id"], page: number, limit: number) {
  if (!clientId) {
    throw new BadRequestError("clientId가 필요합니다.");
  }
  const offset = (page - 1) * limit;
  return estimateRepository.findWritableEstimatesByClientId(clientId, offset, limit, page);
}

export default {
  getWritableEstimates,
};
