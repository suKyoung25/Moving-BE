import { expressjwt } from "express-jwt";
import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { ConflictError } from "../types";
import { ErrorMessage } from "../constants/ErrorMessage";
import authMoverRepository from "../repositories/authMover.repository";
import authClientRepository from "../repositories/authClient.repository";

// 토큰 생성
const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);
}

export const verifyAccessToken = expressjwt({
  secret: secretKey,
  algorithms: ["HS256"],
  requestProperty: "auth", // req.auth에 payload가 들어감 { userId, email, name, userType }
});

// (회원가입/로그인) 컨트롤러단 진입 전 스키마로 req의 구조 확인
export const validateReq =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      const fieldErrors: Record<string, string> = {};

      if (!result.success) {
        fieldErrors.existedPassword = ErrorMessage.PASSWORD_REGEX;
      }

      req.body = result.data; // parse된 req.body로 덮어씌움

      if (Object.keys(fieldErrors).length > 0) {
        throw new ConflictError("중복 정보로 인한 회원가입 실패", fieldErrors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

// (회원가입) 컨트롤러단 진입 전 DB와 대조하여 에러 띄움
export async function checkMoverSignUpInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, phone } = req.body; //주석: zod 통과한 req.body

    const fieldErrors: Record<string, string> = {};

    const existedMover = await authMoverRepository.getMoverByEmail(email);

    if (existedMover) {
      if (existedMover.provider !== "LOCAL") {
        fieldErrors.email = ErrorMessage.ALREADY_EXIST_WITH_SOCIAL;
      } else {
        fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
      }
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

// (로그인) 컨트롤러단 진입 전 DB와 대조하여 에러 띄움
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

// (회원탈퇴) 컨트롤러단 진입 전 DB와 대조하여 에러 띄움
export async function checkMoverWithdrawInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, password } = req.body; //주석: zod 통과한 req.body

    const fieldErrors: Record<string, string> = {};

    const mover = await authMoverRepository.getMoverById(userId);
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

// [Client/회원가입] 서비스 쪽에서 하던 중복 검사를 미들웨어에서 처리
export async function checkClientSignUpInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, phone } = req.body; //주석: zod 통과한 req.body

    // 이미 사용한 정보 확인
    const existingEmail = await authClientRepository.findByEmailRaw(email);
    const existingPhone = await authClientRepository.findByPhone(phone);

    const fieldErrors: Record<string, string> = {};

    if (existingEmail) {
      const provider = existingEmail.provider;

      if (provider !== "LOCAL") {
        fieldErrors.email = `이미 ${provider}로 가입된 계정입니다.`;
      } else {
        fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
      }
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

// (소셜) 로그인 유효성 검사는 미들웨어로 빼는 게 코드 낭비라서 서비스에서 담당함

// 선택적 인증 미들웨어 (토큰이 있으면 인증, 없어도 계속 진행)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      // JWT 검증
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, secretKey);
      req.auth = decoded; // 토큰이 유효하면 req.auth에 설정
    }

    // 토큰이 없거나 유효하지 않아도 계속 진행
    next();
  } catch (error) {
    // JWT 검증 실패해도 계속 진행 (req.auth는 undefined 상태)
    next(error);
  }
};
