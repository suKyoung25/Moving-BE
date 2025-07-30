import favoriteRepository from "../repositories/favorite.repository";
import { BadRequestError } from "../types";
import { Client } from "@prisma/client";

// 찜한 기사님 목록
async function getFavoriteMovers(clientId: Client["id"], page: number = 1, limit: number = 6) {
  if (!clientId) {
    throw new BadRequestError("clientId가 필요합니다.");
  }
  const offset = (page - 1) * limit;
  return favoriteRepository.findFavoriteMoverByClientId(clientId, offset, limit, page);
}

export default {
  getFavoriteMovers,
};
