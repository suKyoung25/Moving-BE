import * as authUtil from "./auth.util";
import bcrypt from "bcrypt";
import { ConflictError } from "../types";
import mock from "../constants/client.mock";

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

describe.only("filterSensitiveUserData 검사", () => {
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
});
