import { NextFunction, Request, Response } from "express";
import { CreateRequestDto } from "../dtos/request.dto";
import requestService from "../services/request.service";

// 견적 요청 (일반 유저)
async function createRequest(
  req: Request<{}, {}, CreateRequestDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const request = await requestService.createRequest({
      request: req.body,
      clientId: req.auth!.userId,
    });
    res.status(201).json({ message: "견적 요청 성공", data: request });
  } catch (error) {
    next(error);
  }
}

// 받은 요청 조회 (기사님)
async function getReceivedRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth!.userId;
    const { result, nextCursor } = await requestService.getReceivedRequests({
      ...req.query,
      moverId,
    });
    res.json({
      message: "받은 요청 조회 성공",
      totalCount: result.length,
      nextCursor,
      requests: result,
    });
  } catch (error) {
    next(error);
  }
}

// 받은 요청 조회(일반)
async function getClientActiveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("고객 활성 요청 조회:", req.auth?.userId);
    
    const requests = await requestService.getClientActiveRequests(req.auth!.userId);
    
    res.status(200).json({
      message: "활성 요청 목록 조회 성공",
      requests
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

export default {
  createRequest,
  getReceivedRequests,
  getClientActiveRequests,
  designateMover,
};
