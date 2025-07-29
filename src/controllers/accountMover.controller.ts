import { Request, Response, NextFunction } from "express";
import accountMoverService from "../services/accountMover.service";

//기사님 기본정보 수정
async function editAccountMover(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth?.userId!;

    const patchData = { ...req.body, moverId };

    const patchedMoverAccount = await accountMoverService.patchMoverAccount(patchData);

    res.status(200).json({ message: "Mover 기본정보 수정 완료", data: patchedMoverAccount });
  } catch (error) {
    next(error);
  }
}

export default {
  editAccountMover,
};
