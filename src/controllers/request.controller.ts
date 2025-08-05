import { ErrorMessage } from "../constants/ErrorMessage";
import {
  CreateRequestDto,
  createRequestSchema,
  RequestDraftDto,
  requestDraftSchema,
} from "../dtos/request.dto";
import requestService from "../services/request.service";
import { BadRequestError } from "../types";
import { NextFunction, Request, Response } from "express";

// 견적 중간 상태 조회
async function getDraft(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;
    const draft = await requestService.getDraft(clientId);
    res.status(200).json({ message: "견적 요청 중간 상태 조회 성공", data: draft });
  } catch (err) {
    next(err);
  }
}

// 견적 중간 상태 저장
async function saveDraft(req: Request<{}, {}, RequestDraftDto>, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;
    const parseResult = requestDraftSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors[0]?.message ?? ErrorMessage.INVALID_INPUT;
      throw new BadRequestError(errorMessage);
    }
    const saved = await requestService.saveDraft(clientId, parseResult.data);
    res.status(200).json({ message: "견적 요청 중간 저장 성공", data: saved });
  } catch (err) {
    next(err);
  }
}

// 보낸 견적 요청 목록 조회 (일반 유저)
async function getRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;
    const { limit, cursor, sort } = req.query;

    const data = await requestService.getRequests({
      clientId,
      limit: Number(limit),
      cursor: cursor as string,
      sort: sort as "asc" | "desc",
    });
    res.status(200).json({ message: "보낸 견적 요청 목록 조회 성공", ...data });
  } catch (err) {
    next(err);
  }
}

// 견적 요청 (일반 유저)
async function createRequest(
  req: Request<{}, {}, CreateRequestDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const clientId = req.auth!.userId;
    const parseResult = createRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors[0]?.message ?? ErrorMessage.INVALID_INPUT;
      throw new BadRequestError(errorMessage);
    }
    const request = await requestService.createRequest({ request: parseResult.data, clientId });
    res.status(201).json({ message: "견적 요청 성공", data: request });
  } catch (error) {
    next(error);
  }
}

// 받은 요청 조회 (기사님)
async function getReceivedRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth!.userId;
    const { result, nextCursor, totalCount } = await requestService.getReceivedRequests({
      ...req.query,
      moverId,
    });
    res.json({
      message: "받은 요청 조회 성공",
      totalCount,
      nextCursor,
      requests: result,
    });
  } catch (error) {
    next(error);
  }
}

// 활성 요청 조회 (일반 유저)
async function getClientActiveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await requestService.getClientActiveRequest(req.auth!.userId);

    res.status(200).json({
      message: "활성 요청 조회 성공",
      data: request,
    });
  } catch (error) {
    console.error("활성 요청 조회 오류:", error);
    next(error);
  }
}

// 기사님 지정 요청
async function designateMover(req: Request, res: Response, next: NextFunction) {
  try {
    await requestService.designateMover(req.auth!.userId, req.body.requestId, req.params.moverId);
    res.status(200).json({ message: "지정 성공" });
  } catch (error) {
    next(error);
  }
}

// 받은 요청 상세 조회(기사님)
async function getReceivedRequestDetail(req: Request, res: Response) {
  const { id } = req.params;
  const moverId = req.auth!.userId; // 로그인된 무버 ID

  try {
    const requestDetail = await requestService.getReceivedRequestDetail(id, moverId);
    if (!requestDetail) {
      return res.status(404).json({ message: "요청 정보를 찾을 수 없습니다." });
    }
    return res.status(200).json({ request: requestDetail });
  } catch (error) {
    console.error("getReceivedRequestDetail error:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}

export default {
  getDraft,
  saveDraft,
  getRequests,
  createRequest,
  getReceivedRequests,
  getClientActiveRequest,
  designateMover,
  getReceivedRequestDetail,
};
