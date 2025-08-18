import { NextFunction, Request, Response } from "express";
import communityService from "../services/community.service";

// 게시글+댓글 전체 조회
async function getAllCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const offset = parseInt(req.query.offset as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const search = req.query.search as string;
    const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;

    const result = await communityService.getAllCommunity(offset, limit, search, targetLang);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

// 게시글 상세 조회
async function getCommunityById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "게시글 ID가 필요합니다.",
      });
    }

    const result = await communityService.getCommunity(id, targetLang);

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

// 해당하는 게시글의 댓글 조회
async function getRepliesByCommunityId(req: Request, res: Response, next: NextFunction) {
  try {
    const communityId = req.params.communityId;
    if (!communityId) {
      res.status(400).json({ success: false, message: "게시글 ID가 필요합니다." });
      return;
    }
    const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;

    const replies = await communityService.getRepliesByCommunityId(communityId, targetLang);

    res.status(200).json(replies);
  } catch (e) {
    next(e);
  }
}

// 커뮤니티 삭제
async function deleteCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.auth!.userId;
    const userType = req.auth!.userType;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "게시글 ID가 필요합니다.",
      });
    }

    const result = await communityService.deleteCommunity(id, userId, userType);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "게시글 삭제 오류.",
      });
    }

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

// 댓글 삭제
async function deleteReply(req: Request, res: Response, next: NextFunction) {
  try {
    const { replyId } = req.params;
    const userId = req.auth!.userId;
    const userType = req.auth!.userType;

    if (!replyId) {
      return res.status(400).json({
        success: false,
        message: "댓글 ID가 필요합니다.",
      });
    }

    const result = await communityService.deleteReply(replyId, userId, userType);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "댓글 삭제 오류.",
      });
    }

    res.status(200).json(result);
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
  deleteCommunity,
  deleteReply,
};
