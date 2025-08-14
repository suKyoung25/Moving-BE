import express, { RequestHandler } from "express";
import communityController from "../controllers/community.controller";
import { optionalAuth, verifyAccessToken } from "../middlewares/auth.middleware";
import { translationMiddleware } from "../middlewares/translation.middleware";

const communityRouter = express.Router();

communityRouter.get(
  "/",
  optionalAuth,
  translationMiddleware([
    "data.communities.content",
    "data.communities.title",
    "data.communities.replies.content",
  ]),
  communityController.getAllCommunity as RequestHandler,
);
communityRouter.get(
  "/:id",
  optionalAuth,
  translationMiddleware(["data.content", "data.title"]),
  communityController.getCommunityById,
);
communityRouter.post("/", verifyAccessToken, communityController.createCommunity);
communityRouter.post("/:communityId/replies", verifyAccessToken, communityController.createReply);
communityRouter.get(
  "/:communityId/replies",
  optionalAuth,
  translationMiddleware(["content"]),
  communityController.getRepliesByCommunityId,
);
communityRouter.delete("/:id", verifyAccessToken, communityController.deleteCommunity);
communityRouter.delete("/reply/:replyId", verifyAccessToken, communityController.deleteReply);

export default communityRouter;
