import { Router } from "express";
import communityController from "../controllers/community.controller";
import { optionalAuth, verifyAccessToken } from "../middlewares/auth.middleware";

const communityRouter = Router();

// 커뮤니티 게시글 조회
communityRouter.get("/", optionalAuth, communityController.getAllCommunity);

// 커뮤니티 게시글 상세 조회
communityRouter.get("/:id", optionalAuth, communityController.getCommunityById);

// 커뮤니티 게시글 작성
communityRouter.post("/", verifyAccessToken, communityController.createCommunity);

// 커뮤니티 댓글 작성
communityRouter.post("/:communityId/replies", verifyAccessToken, communityController.createReply);

// 커뮤니티 댓글 조회
communityRouter.get(
  "/:communityId/replies",
  optionalAuth,
  communityController.getRepliesByCommunityId,
);

// 커뮤니티 게시글 수정
communityRouter.patch("/:id", verifyAccessToken, communityController.updateCommunity);

// 커뮤니티 댓글 수정
communityRouter.patch("/reply/:id", verifyAccessToken, communityController.updateReply);

// 커뮤니티 게시글 삭제
communityRouter.delete("/:id", verifyAccessToken, communityController.deleteCommunity);

// 커뮤니티 댓글 삭제
communityRouter.delete("/reply/:replyId", verifyAccessToken, communityController.deleteReply);

export default communityRouter;
