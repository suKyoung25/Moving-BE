import favoriteService from "@/services/favorite.service";
import { NextFunction, Request, Response } from "express";

// 찜한 기사님 목록
async function getFavoriteMovers(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    const result = await favoriteService.getFavoriteMovers(clientId, page, limit);
    res.status(200).json({
      message: "찜한 기사님 목록 조회 성공",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getFavoriteMovers,
};
