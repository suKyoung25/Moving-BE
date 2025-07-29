/**
 * @file passport.config.ts
 * @description 소셜 로그인을 위한 Passport 전략 설정 정의
 */

// !!!
import passport from "passport";
import googleStrategy from "../middlewares/passport/googleStrategy";
import kakaoStrategy from "../middlewares/passport/kakaoStrategy";
import naverStrategy from "../middlewares/passport/naverStrategy";

passport.use("google", googleStrategy);
passport.use("kakao", kakaoStrategy);
passport.use("naver", naverStrategy);
