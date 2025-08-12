import { NextFunction, Request, Response } from "express";
import communityService from "../services/community.service";

// 게시글+댓글 전체 조회
async function getAllCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const offset = parseInt(req.query.offset as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const result = await communityService.getAllCommunity(offset, limit);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

// 게시글 상세 조회
async function getCommunityById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "게시글 ID가 필요합니다.",
      });
    }

    const result = await communityService.getCommunity(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

//게시글 작성
async function createCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content } = req.body;

    const userId = req.auth!.userId;
    const userType = req.auth!.userType;

    const createData = {
      title,
      content,
      clientId: userType === "client" ? userId : undefined,
      moverId: userType === "mover" ? userId : undefined,
    };

    const result = await communityService.createCommunity(createData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

// 댓글 작성
async function createReply(req: Request, res: Response, next: NextFunction) {
  try {
    const { communityId } = req.params;
    const { content } = req.body;
    const userId = req.auth!.userId;
    const userType = req.auth!.userType;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "게시글 ID가 필요합니다.",
      });
    }

    const createData = {
      content,
      communityId,
      clientId: userType === "client" ? userId : undefined,
      moverId: userType === "mover" ? userId : undefined,
    };

    const result = await communityService.createReply(createData);

    if (!result?.success) {
      return res.status(400).json({
        success: false,
        message: "댓글을 작성할 수 없습니다.",
      });
    }

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function getRepliesByCommunityId(req: Request, res: Response, next: NextFunction) {
  try {
    const communityId = req.params.communityId;
    if (!communityId) {
      res.status(400).json({ success: false, message: "게시글 ID가 필요합니다." });
      return;
    }

    const replies = await communityService.getRepliesByCommunityId(communityId);

    res.status(200).json(replies);
  } catch (e) {
    next(e);
  }
}

export default {
  getAllCommunity,
  createCommunity,
  createReply,
  getCommunityById,
  getRepliesByCommunityId,
};
