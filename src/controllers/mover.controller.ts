import { Request, Response, NextFunction } from "express";
import moverService from "../services/mover.service";

async function getMovers(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      area,
      serviceType,
      sortBy = "mostReviewed",
    } = req.query;

    const params = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      search: search as string,
      area: area as string,
      serviceType: serviceType as string,
      sortBy: sortBy as string,
    };

    const result = await moverService.getMovers(req.auth?.userId, params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getMoverDetail(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("✅ getMoverDetail called", req.params.moverId);
    const result = await moverService.getMoverDetail(req.params.moverId, req.auth?.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// 새로운 토글 엔드포인트
async function toggleFavoriteMover(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("찜 토글 요청:", {
      userId: req.auth?.userId,
      moverId: req.params.moverId
    });

    const result = await moverService.toggleFavoriteMover(req.auth!.userId, req.params.moverId);
    
    const message = result.action === 'added' ? '찜 추가 성공' : '찜 해제 성공';
    
    res.status(200).json({
      message,
      action: result.action,
      isFavorite: result.isFavorite,
      favoriteCount: result.favoriteCount
    });
  } catch (error) {
    console.error("찜 토글 오류:", error);
    next(error);
  }
}

// 기사님 본인 프로필 조회
async function getMoverProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth!.userId;
    const result = await moverService.getMoverProfile(moverId);
    
    res.status(200).json({
      message: "기사님 프로필 조회 성공",
      data: result
    });
  } catch (error) {
    next(error);
  }
}


export default {
  getMovers,
  getMoverDetail,
  toggleFavoriteMover,
  getMoverProfile,
};