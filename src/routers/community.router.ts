import express, { RequestHandler } from "express";
import communityController from "../controllers/community.controller";
import { optionalAuth, verifyAccessToken } from "../middlewares/auth.middleware";

const communityRouter = express.Router();

communityRouter.get("/", optionalAuth, communityController.getAllCommunity as RequestHandler);
communityRouter.get("/:id", optionalAuth, communityController.getCommunityById);
communityRouter.post("/", verifyAccessToken, communityController.createCommunity);
communityRouter.post("/:communityId/replies", verifyAccessToken, communityController.createReply);
communityRouter.get(
  "/:communityId/replies",
  optionalAuth,
  communityController.getRepliesByCommunityId,
);

export default communityRouter;
