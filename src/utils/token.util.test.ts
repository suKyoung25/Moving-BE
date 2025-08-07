import jwt from "jsonwebtoken";
import { ConflictError, CreatedToken } from "../types";
import { generateAccessToken, generateRefreshToken } from "./token.util";
import { ErrorMessage } from "../constants/ErrorMessage";

// 1단계 - 공통 setUp
jest.mock("jsonwebtoken");
const mockJwtSign = jwt.sign as unknown as jest.Mock<string, [object, string, jwt.SignOptions]>;

describe("token.util.tes.ts 파일을 테스트한다", () => {
  // 1단계 - 공통 setUp
  const mockUser: CreatedToken = {
    userId: "mover-123-user",
    email: "moving@test.com",
    name: "김무빙",
    userType: "mover",
    isProfileCompleted: true,
  };

  const expectedPayload = {
    userId: mockUser.userId,
    email: mockUser.email,
    name: mockUser.name,
    userType: mockUser.userType,
    isProfileCompleted: mockUser.isProfileCompleted,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe("generateAccessToken 함수의 동작을 테스트한다", () => {
    test("JWT_SECRET 환경변수가 없으면 ConflictError를 발생시킨다", async () => {
      // 1단계 setUp - 테스트 준비
      delete process.env.JWT_SECRET;

      // 2단계 (exercise) & 3단계 (assertion) - 테스트 실행 & 테스트 검증
      expect(() => generateAccessToken(mockUser)).toThrow(ConflictError);
      expect(() => generateAccessToken(mockUser)).toThrow(ErrorMessage.JWT_SECRET_NOT_FOUND);
    });

    test("올바른 페이로드로 jwt.sign을 호출한다", () => {
      // 1단계 setUp - 테스트 준비
      mockJwtSign.mockReturnValue("mock-access-token");

      // 2단계 exercise - 테스트 실행
      generateAccessToken(mockUser);

      // 3단계 assertion - 결과 검증
      expect(mockJwtSign).toHaveBeenCalledWith(expectedPayload, "test-secret", { expiresIn: "1h" });
    });

    test("생성된 accessToken을 반환한다", () => {
      // 1단계 setUp - 테스트 준비
      const mockToken = "mock-access-token";
      mockJwtSign.mockReturnValue(mockToken);

      // 2단계 exercise - 테스트 실행
      const result = generateAccessToken(mockUser);

      // 3단계 assertion - 결과 검증
      expect(result).toBe(mockToken);
    });
  });

  describe("generateRefreshToken 함수의 동작을 테스트한다", () => {
    test("JWT_SECRET 환경변수가 없으면 ConflictError를 발생시킨다", async () => {
      // 1단계 setUp - 테스트 준비
      delete process.env.JWT_SECRET;

      // 2단계 exercise & 3단계 assertion - 테스트 실행 및 결과 검증
      expect(() => generateRefreshToken(mockUser)).toThrow(ConflictError);
      expect(() => generateRefreshToken(mockUser)).toThrow(ErrorMessage.JWT_SECRET_NOT_FOUND);
    });

    test("올바른 페이로드로 jwt.sign을 호출한다", () => {
      // 1단계 setUp - 테스트 준비
      mockJwtSign.mockReturnValue("mock-refresh-token");

      // 2단계 exercise - 테스트 실행
      generateRefreshToken(mockUser);

      // 3단계 assertion - 결과 검증
      expect(mockJwtSign).toHaveBeenCalledWith(expectedPayload, "test-secret", { expiresIn: "7d" });
    });

    test("생성된 refreshToken을 반환한다", () => {
      // 1단계 setUp - 테스트 준비
      const mockToken = "mock-refresh-token";
      mockJwtSign.mockReturnValue(mockToken);

      // 2단계 exercise - 테스트 실행
      const result = generateRefreshToken(mockUser);

      // 3단계 assertion - 결과 검증
      expect(result).toBe(mockToken);
    });
  });
});
