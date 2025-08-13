import { Response, Request, NextFunction } from "express";
import accountMoverRepository from "../repositories/accountMover.repository";
import { ErrorMessage } from "../constants/ErrorMessage";
import { ConflictError } from "../types";
import { upload } from "../utils/uploadToS3";

// (프로필) 컨트롤러단 진입 전 DB와 대조하여 에러 띄움
export async function checkMoverProfileInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const fieldErrors: Record<string, string> = {};

    const moverId = req.auth?.userId!;

    // 내 닉네임을 제외하고 존재하는 닉네임인지 확인
    const isExistedNickName = await accountMoverRepository.findMoverByNickNameExcludingSelf(
      req.body.nickName,
      moverId,
    );

    if (isExistedNickName) {
      fieldErrors.nickName = ErrorMessage.ALREADY_EXIST_NICKNAME;
    }

    // 안 맞는 데이터 있으면 프론트로 에러 보내기
    if (Object.keys(fieldErrors).length > 0) {
      throw new ConflictError("DB와 대조 시 유효하지 않아서 실패: ", fieldErrors);
    }

    next();
  } catch (error) {
    next(error);
  }
}

// (프로필 이미지 등록 시) 컨트롤러단 진입 전 크기 확인
export async function checkProfileImageSize(req: Request, res: Response, next: NextFunction) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "파일 크기 초과 (1MB 제한)" });
      }
      return res.status(400).json({ message: err.message });
    }

    next();
  });
}
