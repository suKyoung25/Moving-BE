import express from "express";
import accountMoverController from "../controllers/accountMover.controller";

const accountRouter = express.Router();

//기사님 기본정보 수정
accountRouter.patch("/edit/mover", accountMoverController.editAccountMover);

export default accountRouter;
