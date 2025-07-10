import { NextFunction, Request, Response } from "express";
import { CreateRequestDto } from "../dtos/estimate.dto";
import estimateService from "../services/estimate.service";

// 작성 가능한 리뷰 목록
async function getWritableEstimates(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;
    const estimates = await estimateService.getWritableEstimates(clientId);
    res.status(200).json({
      message: "작성 가능한 리뷰 견적 목록 조회 성공",
      data: estimates,
    });
  } catch (error) {
    next(error);
  }
}

// 견적 요청 생성
async function createEstimateRequest(
  req: Request<{}, {}, CreateRequestDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const newRequest = await estimateService.createEstimateRequest({
      request: req.body,
      clientId: req.auth?.userId ?? "e93cebbf-dedb-4f9c-aecd-7152fb6ad997", // TODO: 인증 미들웨어 추가시 수정
    });
    res.status(201).json({ data: newRequest });
  } catch (error) {
    next(error);
  }
}

export default {
  getWritableEstimates,
  createEstimateRequest,
};
