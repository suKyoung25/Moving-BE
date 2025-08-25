import * as authUtil from "./auth.util";
import bcrypt from "bcrypt";
import { ConflictError } from "../types";
import mock from "../mocks/client.mock";

jest.mock("bcrypt");

describe("hashPassword 검사", () => {
  test("비밀번호를 넣으면 해싱해서 반환한다", async () => {
    // 1. 준비
    const normalPassword = "asdf1234";
    const hashedPassword = "asdf1234에무언가덧붙여짐";

    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

    // 2. 실행
    const result = await authUtil.hashPassword(normalPassword);

    // 3. 검증
    expect(bcrypt.hash).toHaveBeenCalledWith(normalPassword, 10);
    expect(result).toBe(hashedPassword);
  });
});

describe("filterSensitiveUserData 검사", () => {
  // 1. 사전 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("일반 로그인 시, 비밀번호와 providerId를 제거해 반환한다.", () => {
    // 2. 실행
    const result = authUtil.filterSensitiveUserData(mock.fullClientInfo as any);

    // 3. 검증
    expect(result).not.toHaveProperty("hashedPassword");
    expect(result).not.toHaveProperty("providerId");
    expect(result).toMatchObject({
      id: mock.fullClientInfo.id,
      email: mock.fullClientInfo.email,
      name: mock.fullClientInfo.name,
      phone: mock.fullClientInfo.phone,
    });
  });

  test("소셜 로그인 시, 비밀번호와 providerId를 제거해 반환한다.", () => {
    // 2. 실행
    const result = authUtil.filterSensitiveUserData(mock.fullClientSocialInfoAfter as any);

    // 3. 검증
    expect(result).not.toHaveProperty("hashedPassword");
    expect(result).not.toHaveProperty("providerId");
    expect(result).toMatchObject({
      id: mock.fullClientSocialInfoAfter.id,
      email: mock.fullClientSocialInfoAfter.email,
      name: mock.fullClientSocialInfoAfter.name,
      phone: mock.fullClientSocialInfoAfter.phone,
    });
  });
});

describe("verifyPassword 검사", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("비밀번호가 일치하면 true를 반환한다.", async () => {
    // 1. 준비
    const inputPassword = "asdf1234";
    const savedPassword = "asdf1234";

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // 2. 실행
    const result = await authUtil.verifyPassword(inputPassword, savedPassword);

    // 3. 검증
    expect(result).toBeTruthy();
    expect(bcrypt.compare).toHaveBeenCalledWith(inputPassword, savedPassword);
  });

  test("비밀번호가 일치하지 않으면 오류를 던진다.", async () => {
    // 1. 준비
    const inputPassword = "asdf1234";
    const savedPassword = "asdf1234!";

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // 2-3. 실행 및 검증 -- 오류 나면 끝까지 도달을 못 해서 바로 rejects 던져야 함
    await expect(authUtil.verifyPassword(inputPassword, savedPassword)).rejects.toThrow(
      ConflictError,
    );
  });
});
