import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../types/errors";

export default function fakeAuth(req: Request, res: Response, next: NextFunction) {
    // 실제 인증 로직이 있다면 여기서 처리
    const userId = "test1"; // 실제 DB에 존재하는 clientId로 대체
    if (!userId) {
        // 인증 실패 시 바로 에러를 next로 전달
        return next(new UnauthorizedError("인증 정보가 없습니다."));
    }
    req.auth = { userId };
    next();
}
