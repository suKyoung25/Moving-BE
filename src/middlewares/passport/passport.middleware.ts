import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { BadRequestError } from "../../types";

// [소셜 로그인] 미들웨어
export function createSocialAuthMiddleware(strategy: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("들어옴");
    passport.authenticate(
      strategy,
      {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/sign-in/client?error=login_failed`,
      },
      (error: any, user: any) => {
        if (error) {
          console.error(`${strategy} 로그인에서 오류 발생: `, error.message);

          // 이메일 관련 오류들 BadRequestError로 통합
          if (error instanceof BadRequestError) {
            console.log("오류 핸들러 들어옴");
            const redirectUrl = new URL(`${process.env.FRONTEND_URL}/sign-in/client`);
            redirectUrl.searchParams.set("error", encodeURIComponent(error.message));
            console.log("여기까지 넘어옴");
            return res.redirect(redirectUrl.toString());
          }
          console.log("나옴");
          return next(error);
        }

        // redirect되면 여기는 실행x
        if (!user) {
          const redirectUrl = new URL(`${process.env.FRONTEND_URL}/sign-in/client`);
          redirectUrl.searchParams.set("error", encodeURIComponent("로그인에 실패했습니다."));
          return res.redirect(redirectUrl.toString());
        }

        // 성공한 경우 req.user에 사용자 정보 설정하고 다음 미들웨어로
        req.user = user;
        next();
      },
    )(req, res, next);
  };
}
