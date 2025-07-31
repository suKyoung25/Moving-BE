import estimateService from "../services/estimate.service";
import { NextFunction, Request, Response } from "express";

// 대기 중인 견적 조회
async function getPendingEstimates(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;

    const data = await estimateService.getPendingEstimates(clientId);

    return res.status(200).json({
      message: "대기 중인 견적 조회 성공",
      data,
    });
  } catch (e) {
    next(e);
  }
}

// 견적 요청하기
async function sendEstimateToRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const moverId = req.auth!.userId;
    const { price, comment, clientId, requestId } = req.body;

    // TODO: 커스텀 에러 객체 사용해주세요
    if (!price || !comment || !clientId || !requestId) {
      res.status(400).json({
        message: "price, comment, clientId, requestId는 모두 필수입니다.",
      });
      return;
    }

    const updatedEstimate = await estimateService.createEstimate({
      price,
      comment,
      moverId,
      clientId,
      requestId,
    });

    res.status(200).json({
      message: "견적 요청 성공",
      data: updatedEstimate,
    });
  } catch (error) {
    console.error("견적 요청 실패:", error);
    next(error);
  }
}

// 보낸 견적 요청 상세
export async function getSentEstimateDetail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const moverId = req.auth?.userId;
    const estimateId = req.params.id;

    if (!moverId || !estimateId) {
      res.status(400).json({
        message: "moverId (인증 정보)와 estimateId는 필수입니다.",
      });
      return;
    }

    const estimate = await estimateService.findSentEstimateById(moverId, estimateId);

    if (!estimate) {
      res.status(404).json({
        message: "해당 견적 요청을 찾을 수 없습니다.",
      });
      return;
    }

    res.status(200).json({
      message: "보낸 견적 요청 상세 조회 성공",
      data: estimate,
    });
  } catch (error) {
    console.error("보낸 견적 요청 상세 조회 실패:", error);
    next(error);
  }
}

// 견적 거절하기
async function rejectEstimate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const moverId = req.auth!.userId;

    const { comment, clientId, requestId } = req.body;

    if (!comment || !clientId || !requestId) {
      res.status(400).json({
        message: "comment,  clientId, requestId는 모두 필수입니다.",
      });
      return;
    }

    const updatedEstimate = await estimateService.rejectEstimate({
      comment,
      moverId,
      clientId,
      requestId,
    });

    res.status(200).json({
      message: "견적 거절 성공",
      data: updatedEstimate,
    });
  } catch (error) {
    console.error("견적 거절 실패:", error);
    next(error);
  }
}

// 보낸 견적 조회
async function getSentEstimates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const moverId = req.auth!.userId;

    if (!moverId) {
      res.status(401).json({ message: "moverId (사용자 인증 정보)가 필요합니다." });
      return;
    }

    const sentEstimates = await estimateService.findEstimatesByMoverId(moverId);

    res.status(200).json({
      message: "보낸 견적 조회 성공",
      data: sentEstimates,
    });
  } catch (error) {
    console.error("보낸 견적 조회 실패:", error);
    next(error);
  }
}

// 반려한 견적 조회
async function getRejectedEstimates(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const moverId = req.auth!.userId;

    if (!moverId) {
      res.status(401).json({ message: "moverId (사용자 인증 정보)가 필요합니다." });
      return;
    }

    const sentEstimates = await estimateService.getEstimatesByStatus(moverId);

    res.status(200).json({
      message: "반려한 견적 조회 성공",
      data: sentEstimates,
    });
  } catch (error) {
    console.error("반려한 견적 조회 실패:", error);
    next(error);
  }
}

// 대기중연 견적 조회
async function getReceivedEstimates(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;
    const category = (req.query.category as "all" | "confirmed") || "all";
    const data = await estimateService.getReceivedEstimates(clientId, category);
    return res.status(200).json({
      message: "받은 견적 조회 성공",
      data: data,
    });
  } catch (e) {
    next(e);
  }
}

// 견적 확정하기
async function confirmEstimate(req: Request, res: Response, next: NextFunction) {
  try {
    const { estimateId } = req.body;
    const clientId = req.auth!.userId;

    if (!estimateId) {
      return res.status(400).json({ message: "estimateId는 필수입니다." });
    }

    const result = await estimateService.confirmEstimate(estimateId, clientId);

    res.status(200).json({
      message: "견적 확정 성공",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

// 견적 상세 조회
async function getEstimateDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { estimateId } = req.params;
    const clientId = req.auth!.userId;

    if (!estimateId) {
      return res.status(400).json({ message: "estimateId는 필수입니다." });
    }

    const estimateDetail = await estimateService.getEstimateDetail(estimateId, clientId);

    res.status(200).json({
      message: "견적 상세 조회 성공",
      data: estimateDetail,
    });
  } catch (e) {
    next(e);
  }
}

export default {
  getPendingEstimates,
  sendEstimateToRequest,
  getSentEstimateDetail,
  rejectEstimate,
  getSentEstimates,
  getRejectedEstimates,
  getReceivedEstimates,
  confirmEstimate,
  getEstimateDetail,
};
