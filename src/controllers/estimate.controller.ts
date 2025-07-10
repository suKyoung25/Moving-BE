import { NextFunction, Request, Response } from "express";
import estimateService from "../services/estimate.service";

// 작성 가능한 리뷰 목록
async function getWritableEstimates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const clientId = req.auth?.userId;
    if (!clientId) {
      res.status(401).json({ message: "인증 정보가 없습니다." });
      return;
    }
    const estimates = await estimateService.getWritableEstimates(clientId);
    res.status(200).json({
      status: 200,
      message: "작성 가능한 리뷰 견적 목록 조회 성공",
      data: estimates,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getWritableEstimates,
};
