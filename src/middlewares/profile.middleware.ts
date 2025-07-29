import { Response, Request, NextFunction } from "express";
import authMoverRepository from "../repositories/authMover.repository";
import { ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import accountMoverRepository from "../repositories/accountMover.repository";
import bcrypt from "bcrypt";

// (프로필) 컨트롤러단 진입 전 DB와 대조하여 에러 띄움
export async function checkMoverProfileInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth?.userId!;

    //DB에 존재하는 본인 확인 (authRepository쪽 로직 사용)
    const existedMoverData = await authMoverRepository.getMoverByEmail(req.body.email);

    // "현재 비밀번호"가 DB에 있는 비밀번호와 일치하는지 검사 (본인 확인)
    const isPasswordCorrect = await bcrypt.compare(
      req.body.existedPassword,
      existedMoverData?.hashedPassword!,
    );

    //내 이메일을 제외하고 존재하는 이메일인지 확인
    const isExistedEmail = await accountMoverRepository.findMoverByEmailExcludingSelf(
      req.body.email,
      moverId,
    );

    //내 폰번호를 제외하고 존재하는 폰번호인지 확인
    const isExistedPhone = await accountMoverRepository.findMoverByPhoneExcludingSelf(
      req.body.phone,
      moverId,
    );

    const fieldErrors: Record<string, string> = {};

    if (isExistedEmail) {
      fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
    }
    if (!isPasswordCorrect) {
      fieldErrors.existedPassword = ErrorMessage.PASSWORD_NOT_MATCH;
    }
    if (isExistedPhone) {
      fieldErrors.phone = ErrorMessage.ALREADY_EXIST_PHONE;
    }

    //안 맞는 데이터 있으면 프론트로 에러 보내기
    if (Object.keys(fieldErrors).length > 0) {
      throw new ConflictError("DB와 대조 시 유효하지 않아서 실패: ", fieldErrors);
    }

    next();
  } catch (error) {
    next(error);
  }
}
