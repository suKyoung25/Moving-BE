import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ConflictError, NotFoundError, UnauthorizedError } from "../types";
import { ErrorMessage } from "../constants/ErrorMessage";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import profileClientRepository from "../repositories/client.repository";
import profileMoverRespository from "../repositories/profileMover.respository";

// refreshToken Api
async function setRefreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. 쿠키에서 refreshToken 가져옴
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedError(ErrorMessage.REFRESHTOKEN_NOT_FOUND);

    // 2. refreshToken 검증
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);

    const payload = jwt.verify(refreshToken, secret) as jwt.JwtPayload;

    // 3. 새로운 토큰 설정
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      userType: payload.userType,
    });

    // 4. 반환
    res.status(200).json({ message: "AccessToken 갱신 성공", accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
}

// 토큰으로 사용자 불러오기
async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.auth;

    if (!user) {
      res.status(401).json({ message: "사용자 인증 정보가 없습니다." });
    }

    // userType에 따라 불러오는 정보 달라짐
    let newUser;

    if (user?.userType === "client") {
      newUser = await profileClientRepository.findById(user.userId);
    }

    // userType에 따라 불러오는 정보 달라짐
    if (user?.userType === "mover") {
      newUser = await profileMoverRespository.findById(user.userId);
    }

    res.status(200).json({ message: "사용자 데이터 반환 성공", user: newUser });
  } catch (error) {
    next(error);
  }
}

// 소셜 로그인
async function signInEasily(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as any;

    if (!user) throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name ?? null,
      userType: user.userType,
      isProfileCompleted: user.isProfileCompleted,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 데이터 받자마자 FE로 넘김 - accessToken은 쿼리로
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/api/auth/callback`);
    redirectUrl.searchParams.set("token", accessToken);

    // 데이터 받자마자 FE로 넘김 - refreshToken은 쿠키로
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000, // 2주
    });

    res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
}

const authController = {
  setRefreshToken,
  getMe,
  signInEasily,
};

export default authController;
