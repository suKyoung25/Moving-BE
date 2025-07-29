import express from "express";
import accountMoverController from "../controllers/accountMover.controller";
import { validateReq } from "../middlewares/auth.middleware";
import { editAccountMoverSchema } from "../dtos/accountMover.dto";
import { checkMoverProfileInfo } from "../middlewares/profile.middleware";

const accountRouter = express.Router();

//기사님 기본정보 수정
accountRouter.patch(
  "/edit/mover",
  validateReq(editAccountMoverSchema),
  checkMoverProfileInfo,
  accountMoverController.editAccountMover,
);

export default accountRouter;
