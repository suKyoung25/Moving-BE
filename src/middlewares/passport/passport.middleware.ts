import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { BadRequestError } from "../../types";

// [소셜 로그인] 미들웨어: 일단 client로 가게 해놨는데 userType 받아야 함
export function createSocialAuthMiddleware(strategy: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. FE에서 userType 추출
    const userType = (req.query.state as string) || "client";

    passport.authenticate(strategy, { session: false }, (error: any, user: any) => {
      // 2. 소셜 로그인에 실패하면 로그인 페이지로 돌아옴 (Client/Mover는 userType 받아서)
      const failureRedirectUrl = `${process.env.FRONTEND_URL}/sign-in/${userType}`;

      if (error) {
        console.error(`${strategy} 로그인에서 오류 발생: `, error.message);
        const redirectUrl = new URL(failureRedirectUrl);

        // 3. 인증 관련 이메일 관련 오류들 BadRequestError로 통합
        if (error instanceof BadRequestError) {
          redirectUrl.searchParams.set("error", encodeURIComponent(error.message));
          return res.redirect(redirectUrl.toString());
        }

        // 4. 기타 일반적인 오류 처리 (없을 것 같지만...)
        redirectUrl.searchParams.set("error", encodeURIComponent("로그인 중 오류가 발생했습니다."));
        return res.redirect(redirectUrl.toString());
      }

      // 5. 인증은 성공했는데 사용자 정보가 없는 경우
      if (!user) {
        const redirectUrl = new URL(failureRedirectUrl);
        redirectUrl.searchParams.set("error", encodeURIComponent("로그인에 실패했습니다."));
        return res.redirect(redirectUrl.toString());
      }

      // 위의 과정이 전부 성공한 경우 req.user에 사용자 정보를 설정하고 다음 미들웨어로 이동
      req.user = user;
      next();
    })(req, res, next);
  };
}
