import moverRepository from "../repositories/mover.repository";
import { BadRequestError } from "../types";
import { translateData } from "../utils/translation.util";

interface GetMoversParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
  serviceType?: string;
  sortBy?: string;
}

// 전체 기사님 리스트 조회
async function getMovers(clientId?: string, params: GetMoversParams = {}, targetLang?: string) {
  // 페이지네이션 파라미터 검증
  const { page = 1, limit = 10 } = params;

  if (page < 1) throw new BadRequestError("페이지는 1 이상이어야 합니다.");
  if (limit < 1 || limit > 100) throw new BadRequestError("limit은 1-100 사이여야 합니다.");

  const result = await moverRepository.fetchMovers(clientId, params);

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return (await translateData(result, ["movers.introduction"], targetLang)) as typeof result;
  }

  return result;
}

// 기사님 상세 조회
async function getMoverDetail(moverId: string, clientId?: string, targetLang?: string) {
  if (!moverId) throw new BadRequestError("moverId가 필요합니다.");

  const result = await moverRepository.fetchMoverDetail(moverId, clientId);

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return (await translateData(
      result,
      ["introduction", "description"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

// 찜 토글 (추가/삭제를 자동으로 판단)
async function toggleFavoriteMover(clientId: string, moverId: string) {
  if (!clientId || !moverId) {
    throw new BadRequestError("clientId 또는 moverId가 필요합니다.");
  }

  return moverRepository.toggleFavoriteMover(clientId, moverId);
}

// 기사님 본인 프로필 조회
async function getMoverProfile(moverId: string, targetLang?: string) {
  if (!moverId) {
    throw new BadRequestError("moverId가 필요합니다.");
  }

  // 기존 fetchMoverDetail 재활용 (clientId 없이 호출)
  const result = await moverRepository.fetchMoverDetail(moverId);

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return (await translateData(
      result,
      ["data.introduction", "data.description"],
      targetLang,
    )) as typeof result;
  }

  return result;
}

export default {
  getMovers,
  getMoverDetail,
  toggleFavoriteMover,
  getMoverProfile,
};
