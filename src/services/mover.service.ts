import moverRepository from "../repositories/mover.repository";
import { BadRequestError, ForbiddenError } from "../types/errors";

// 전체 기사님 리스트 조회
async function getMovers(clientId?: string) {
  return moverRepository.fetchMovers(clientId);
}

// 기사님 상세 조회
async function getMoverDetail(moverId: string, clientId?: string) {
  if (!moverId) throw new BadRequestError("moverId가 필요합니다.");
  return moverRepository.fetchMoverDetail(moverId, clientId);
}

// 찜하기
async function favoriteMover(clientId: string, moverId: string) {
  if (!clientId || !moverId)
    throw new BadRequestError("clientId 또는 moverId가 필요합니다.");

  return moverRepository.addFavoriteMover(clientId, moverId);
}

// 찜 취소
async function unfavoriteMover(clientId: string, moverId: string) {
  if (!clientId || !moverId)
    throw new BadRequestError("clientId 또는 moverId가 필요합니다.");

  return moverRepository.removeFavoriteMover(clientId, moverId);
}

// 기사 지정
async function designateMover(clientId: string, requestId: string, moverId: string) {
  if (!clientId || !requestId || !moverId)
    throw new BadRequestError("필수 값 누락");

  return moverRepository.designateMover(requestId, moverId);
}

export default {
  getMovers,
  getMoverDetail,
  favoriteMover,
  unfavoriteMover,
  designateMover,
};
