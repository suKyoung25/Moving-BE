import { Request, Response, NextFunction } from "express";
import moverService from "../services/mover.service";

async function getMovers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await moverService.getMovers(req.auth?.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getMoverDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await moverService.getMoverDetail(req.params.moverId, req.auth?.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function favoriteMover(req: Request, res: Response, next: NextFunction) {
  try {
    await moverService.favoriteMover(req.auth!.userId, req.params.moverId);
    res.status(200).json({ message: "찜 성공" });
  } catch (error) {
    next(error);
  }
}

async function unfavoriteMover(req: Request, res: Response, next: NextFunction) {
  try {
    await moverService.unfavoriteMover(req.auth!.userId, req.params.moverId);
    res.status(200).json({ message: "찜 취소 성공" });
  } catch (error) {
    next(error);
  }
}

async function designateMover(req: Request, res: Response, next: NextFunction) {
  try {
    await moverService.designateMover(req.auth!.userId, req.body.requestId, req.params.moverId);
    res.status(200).json({ message: "지정 성공" });
  } catch (error) {
    next(error);
  }
}

export default {
  getMovers,
  getMoverDetail,
  favoriteMover,
  unfavoriteMover,
  designateMover,
};
