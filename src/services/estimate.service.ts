import { Client } from "@prisma/client";
import estimateRepository from "../repositories/estimate.repository";
import { BadRequestError } from "../types/errors";

// 작성 가능한 리뷰 목록
async function getWritableEstimates(clientId: Client["id"]) {
  if (!clientId) {
    throw new BadRequestError("clientId가 필요합니다.");
  }
  return estimateRepository.findWritableEstimatesByClientId(clientId);
}

export default {
  getWritableEstimates,
};
