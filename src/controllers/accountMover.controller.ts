import { Request, Response, NextFunction } from "express";
import accountMoverService from "../services/accountMover.service";
import { editAccountMoverSchema } from "../dtos/accountMover.dto";

//기사님 기본정보 수정
async function editAccountMover(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth?.userId!;

    // Zod 스키마로 데이터 검증 및 변환
    const parsedDate = editAccountMoverSchema.parse(req.body);

    const newData = {
      moverId,
      name: parsedDate.name,
      email: parsedDate.email,
      phone: parsedDate.phone,
      newPassword: parsedDate.newPassword,
    };

    const patchedMoverAccount = await accountMoverService.patchMoverAccount(newData);

    res.status(200).json({ message: "Mover 기본정보 수정 완료", data: patchedMoverAccount });
  } catch (error) {
    next(error);
  }
}

export default {
  editAccountMover,
};
