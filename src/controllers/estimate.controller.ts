import { rejectEstimateSchema, sendEstimateSchema } from "../dtos/estimate.dto";
import estimateService from "../services/estimate.service";
import { NextFunction, Request, Response } from "express";

// 대기 중인 견적 조회
async function getPendingEstimates(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;
    const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;

    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 6;

    const data = await estimateService.getPendingEstimates(clientId, offset, limit, targetLang);

    res.status(200).json({
      message: "대기 중인 견적 조회 성공",
      ...(data as Record<string, unknown>),
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

    const parsed = sendEstimateSchema.parse(req.body);

    const updatedEstimate = await estimateService.createEstimate({
      price: parsed.price,
      comment: parsed.comment,
      moverId,
      clientId: parsed.clientId,
      requestId: parsed.requestId,
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
    const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;

    if (!moverId || !estimateId) {
      res.status(400).json({
        message: "moverId (인증 정보)와 estimateId는 필수입니다.",
      });
      return;
    }

    const estimate = await estimateService.findSentEstimateById(moverId, estimateId, targetLang);

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

    const parsed = rejectEstimateSchema.parse(req.body);

    const updatedEstimate = await estimateService.rejectEstimate({
      comment: parsed.comment,
      moverId,
      clientId: parsed.clientId,
      requestId: parsed.requestId,
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
async function getSentEstimates(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;

    if (!moverId) {
      return res.status(401).json({ message: "인증 필요" });
    }

    const { totalCount, totalPages, estimates } = await estimateService.getPaginatedSentEstimates(
      moverId,
      page,
      targetLang,
    );

    res.status(200).json({
      message: "보낸 견적 조회 성공",
      totalCount,
      totalPages,
      data: estimates,
    });
  } catch (error) {
    console.error("보낸 견적 조회 실패:", error);
    next(error);
  }
}

// 반려한 견적 조회
async function getRejectedEstimates(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth?.userId;
    const page = parseInt(req.query.page as string) || 1;

    if (!moverId) {
      return res.status(401).json({ message: "로그인 된 사용자가 없습니다." });
    }

    const { totalCount, totalPages, estimates } = await estimateService.getRejectedEstimates(
      moverId,
      page,
    );

    res.status(200).json({
      message: "반려된 견적 조회 성공",
      totalCount,
      totalPages,
      data: estimates,
    });
  } catch (error) {
    console.error("반려 견적 조회 실패:", error);
    next(error);
  }
}

// 받은 견적 조회
async function getReceivedEstimates(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;
    const category = (req.query.category as "all" | "confirmed") || "all";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, totalCount } = await estimateService.getReceivedEstimates(
      clientId,
      page,
      limit,
      category,
    );

    res.status(200).json({
      message: "받은 견적 조회 성공",
      data,
      totalCount,
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

// 견적 취소하기
async function deleteEstimate(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth?.userId;
    const { id: estimateId } = req.params;

    if (!moverId || !estimateId) {
      return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    const deleted = await estimateService.deleteEstimate(estimateId, moverId);

    if (!deleted) {
      return res.status(404).json({ message: "삭제할 견적이 없거나 권한이 없습니다." });
    }

    res.status(200).json({ message: "견적 삭제 성공", data: deleted });
  } catch (error) {
    console.error("견적 삭제 실패:", error);
    next(error);
  }
}

// 견적 상세 조회 (알림용)
async function getEstimateById(req: Request, res: Response, next: NextFunction) {
  try {
    const { estimateId } = req.params;
    const estimate = await estimateService.getEstimateById(estimateId);
    res.status(200).json({ message: "견적 상세 조회 성공", data: estimate });
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
  getEstimateById,
  confirmEstimate,
  getEstimateDetail,
  deleteEstimate,
};
