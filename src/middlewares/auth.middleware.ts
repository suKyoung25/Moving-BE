import { expressjwt } from "express-jwt";
import { BadRequestError, ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import authMoverRepository from "../repositories/authMover.repository";
import bcrypt from "bcrypt";
import authClientRepository from "../repositories/authClient.repository";
import authRepository from "../repositories/auth.repository";

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);
}

export const verifyAccessToken = expressjwt({
  secret: secretKey,
  algorithms: ["HS256"],
  requestProperty: "auth", // req.auth에 payload가 들어감 { userId, email, name, userType }
});

//(회원가입/로그인) 컨트롤러단 진입 전 스키마로 req의 구조 확인
export const validateReq =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        throw new BadRequestError(ErrorMessage.INVALID_INPUT);
      }

      req.body = result.data; // 주석: parse된 req.body로 덮어씌움
      next();
    } catch (error) {
      next(error);
    }
  };

//(회원가입) 컨트롤러단 진입 전 DB와 대조하여 에러 띄움
export async function checkMoverSignUpInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, phone } = req.body; //주석: zod 통과한 req.body

    const fieldErrors: Record<string, string> = {};

    const existedEmail = await authMoverRepository.getMoverByEmail(email);
    if (existedEmail) {
      fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
    }

    const existedPhone = await authMoverRepository.getMoverByPhone(phone);
    if (existedPhone) {
      fieldErrors.phone = ErrorMessage.ALREADY_EXIST_PHONE;
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new ConflictError("중복 정보로 인한 회원가입 실패", fieldErrors);
    }

    next();
  } catch (error) {
    next(error);
  }
}

//(로그인) 컨트롤러단 진입 전 DB와 대조하여 에러 띄움
export async function checkMoverSignInInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body; //주석: zod 통과한 req.body

    const fieldErrors: Record<string, string> = {};

    const mover = await authMoverRepository.getMoverByEmail(email);
    if (!mover) {
      fieldErrors.email = ErrorMessage.USER_NOT_FOUND;
      throw new ConflictError("사용자를 찾을 수 없습니다.", fieldErrors);
    }

    const isPasswordValid = await bcrypt.compare(password, mover.hashedPassword!);
    if (!isPasswordValid) {
      fieldErrors.password = ErrorMessage.PASSWORD_NOT_MATCH;
      throw new ConflictError(ErrorMessage.PASSWORD_NOT_MATCH, fieldErrors);
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ✅ [Client] 서비스 쪽에서 하던 중복 검사를 미들웨어에서 처리
export async function checkClientSignUpInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, phone } = req.body; //주석: zod 통과한 req.body

    // 이미 사용한 정보 확인
    const existingEmail = await authRepository.findByEmailRaw(email);
    const existingPhone = await authClientRepository.findByPhone(phone);

    const fieldErrors: Record<string, string> = {};

    if (existingEmail) {
      fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
    }
    if (existingPhone) {
      fieldErrors.phone = ErrorMessage.ALREADY_EXIST_PHONE;
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new ConflictError("중복 정보로 인한 회원가입 실패: ", fieldErrors);
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ✅ 로그인 유효성 검사 미들웨어 - 쓸지 모르겠음
// export async function checkClientSignInInfo(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { email, password } = req.body;

//     const client = await authClientRepository.findByEmail(email);

//     if (!client) {
//       throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
//     }

//     const isPasswordValid = await bcrypt.compare(password, client.hashedPassword!);
//     if (!isPasswordValid) throw new ConflictError(ErrorMessage.PASSWORD_NOT_MATCH);

//     next();
//   } catch (error) {
//     next(error);
//   }
// }
