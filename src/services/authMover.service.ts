/**
 * @file auth.service.ts
 * @description
 * - 인증 로직을 처리하는 서비스 계층 모듈
 * - repository에서 데이터를 조회하고, 암호화/토큰 관련 유틸 함수 사용
 *
 */

import authRepository from "../repositories/authMover.repository";
import { ConflictError, NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { createMoverInput, getMoverInput } from "../types/mover/auth/authMover.type";
import { hashPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";

//기사님 생성
async function createMover(user: createMoverInput) {
    const existedEmail = await authRepository.findMoverByEmail(user.email);
    if (existedEmail) {
        throw new ConflictError(ErrorMessage.ALREADY_EXIST_EMAIL);
    }
    const existedPhone = await authRepository.findMoverByPhone(user.phone);
    if (existedPhone) {
        throw new ConflictError(ErrorMessage.ALREADY_EXIST_PHONE);
    }

    const hashedPassword = await hashPassword(user.password);
    const createdMover = await authRepository.saveMover({
        ...user,
        hashedPassword,
    });

    const accessToken = generateAccessToken({
        userId: createdMover.id,
        email: createdMover.email,
        name: createdMover.name,
        userType: createdMover.userType,
    });
    const refreshToken = generateRefreshToken({
        userId: createdMover.id,
        email: createdMover.email,
        name: createdMover.name,
        userType: createdMover.userType,
    });

    return {
        accessToken,
        refreshToken,
        user: {
            userId: createdMover.id,
            email: createdMover.email,
            nickName: createdMover.nickName,
            userType: createdMover.userType,
        },
    };
}

//기사님 조회(로그인)
async function getMoverByEmail(user: getMoverInput) {
    const mover = await authRepository.findMoverByEmail(user.email);
    if (!mover) {
        throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
    }

    const accessToken = generateAccessToken({
        userId: mover.id,
        email: mover.email,
        name: mover.name,
        userType: mover.userType,
    });
    const refreshToken = generateRefreshToken({
        userId: mover.id,
        email: mover.email,
        name: mover.name,
        userType: mover.userType,
    });

    return {
        accessToken,
        refreshToken,
        user: {
            userId: mover.id,
            email: mover.email,
            nickName: mover.nickName,
            userType: mover.userType,
        },
    };
}

export default {
    createMover,
    getMoverByEmail,
};
