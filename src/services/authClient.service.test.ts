import authClientService from "./authClient.service";
import authClientRepository from "../repositories/authClient.repository";
import * as authUtils from "../utils/auth.util";
import * as tokenUtils from "../utils/token.util";
import mock from "../mocks/client.mock";

// 의존성 제거 용도로 mock 함수 만듦
jest.mock("../repositories/authClient.repository", () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailRaw: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
}));
jest.mock("../utils/auth.util", () => ({
  hashPassword: jest.fn(),
  filterSensitiveUserData: jest.fn(),
  verifyPassword: jest.fn(),
}));
jest.mock("../utils/token.util", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

// [회원가입] 유효성 검사(이미 있는 전화번호 넣으면 안 됨 등)는 미들웨어에서 처리해서 생략
describe("authClientService에서 회원가입 logic 검사", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("회원가입 성공 시 올바른 객체를 반환한다.", async () => {
    // 1. 준비 = 있는 함수들 다 바꿔치기: 해시, 토큰, 비밀번호x
    const hashedPassword = "asdf1234에이것저것덧붙임";

    (authClientRepository.create as jest.Mock).mockResolvedValue(mock.deficientClientInfo);
    (authUtils.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
    (tokenUtils.generateAccessToken as jest.Mock).mockReturnValue("accessToken을-바꿔친-값이다");
    (tokenUtils.generateRefreshToken as jest.Mock).mockReturnValue("refreshToken을-바꿔친-값이다");
    (authUtils.filterSensitiveUserData as jest.Mock).mockReturnValue(mock.deficientClientInfo);

    // 2. 실행
    const result = await authClientService.create(mock.signUpInfo);

    // 3. 검증
    expect(authUtils.hashPassword).toHaveBeenCalledWith(mock.signUpInfo.password); // 비밀번호 해시 제대로 하고 있는지
    expect(authClientRepository.create).toHaveBeenCalledWith({
      ...mock.signUpInfo,
      password: hashedPassword,
    }); // FE에서 보낸 데이터가 제대로 BE에 변환되어 들어오는지
    expect(result).toEqual({
      accessToken: "accessToken을-바꿔친-값이다",
      refreshToken: "refreshToken을-바꿔친-값이다",
      user: mock.deficientClientInfo,
    }); // 최종 출력 형태가 맞는지
  });
});

// 일반 로그인
describe("authClientService에서 일반 로그인 logic 검사", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("일반 로그인 성공 시 올바른 객체를 반환한다.", async () => {
    // 1. 준비 = 있는 함수들 다 바꿔치기: 토큰, 비밀번호, 이메일로 검색
    (authClientRepository.findByEmail as jest.Mock).mockResolvedValue(mock.deficientClientInfo);
    (authUtils.verifyPassword as jest.Mock).mockResolvedValue(true);
    (tokenUtils.generateAccessToken as jest.Mock).mockReturnValue("accessToken을-바꿔친-값이다");
    (tokenUtils.generateRefreshToken as jest.Mock).mockReturnValue("refreshToken을-바꿔친-값이다");
    (authUtils.filterSensitiveUserData as jest.Mock).mockReturnValue(mock.deficientClientInfo);

    // 2. 실행
    const result = await authClientService.loginWithLocal(mock.loginInfo);

    // 3. 검증
    expect(authClientRepository.findByEmail).toHaveBeenCalledWith(mock.loginInfo.email); // findByEmail로 email 반환
    expect(authUtils.verifyPassword).toHaveBeenCalledWith(
      mock.loginInfo.hashedPassword,
      mock.deficientClientInfo.hashedPassword,
    ); // 비밀번호 같음
    expect(result).toEqual({
      accessToken: "accessToken을-바꿔친-값이다",
      refreshToken: "refreshToken을-바꿔친-값이다",
      user: mock.deficientClientInfo,
    }); // 최종 출력 형태가 맞는지
  });
});

// 소셜 로그인
describe("Client의 소셜 로그인 logic 검사", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("첫 로그인이면 신규 사용자 정보를 DB에 넣는다.", async () => {
    // 1. 준비: 의존할 만한 함수들 바꿔치기
    (authClientRepository.findByEmailRaw as jest.Mock).mockResolvedValue(null); // 새로 만드는 거니까 찾을 이메일x
    (authClientRepository.save as jest.Mock).mockResolvedValue(mock.deficientClientSocialInfo); // 새 User 생성
    (authUtils.filterSensitiveUserData as jest.Mock).mockResolvedValue(
      mock.deficientClientSocialInfo,
    ); // (어차피 없지만) 비밀번호 숨김 처리

    // 2. 실행
    const result = await authClientService.oAuthCreateOrUpdate(mock.socialLoginInfo);

    // 3. 검증
    expect(authClientRepository.findByEmailRaw).toHaveBeenCalledWith(
      mock.deficientClientSocialInfo.email,
    );
    expect(authClientRepository.save).toHaveBeenCalledWith(mock.socialLoginInfo);
    expect(result).toEqual(mock.deficientClientSocialInfo);
  });

  test("두 번째 이상 로그인이면 기존 정보를 불러온다.", async () => {
    // 1. 준비: 의존할 만한 함수들 바꿔치기 + update 메소드 맞춤 객체 생성
    (authClientRepository.findByEmailRaw as jest.Mock).mockResolvedValue(
      mock.deficientClientSocialInfo,
    );
    (authClientRepository.update as jest.Mock).mockResolvedValue(mock.deficientClientSocialInfo); // 있는 User 불러옴
    (authUtils.filterSensitiveUserData as jest.Mock).mockResolvedValue(
      mock.deficientClientSocialInfo,
    ); // (어차피 없지만) 비밀번호 숨김 처리22

    const updateObject = {
      provider: mock.deficientClientSocialInfo.provider,
      providerId: mock.deficientClientSocialInfo.providerId,
    };

    // 2. 실행
    const result = await authClientService.oAuthCreateOrUpdate(mock.socialLoginInfo);

    // 3. 검증
    expect(authClientRepository.findByEmailRaw).toHaveBeenCalledWith(
      mock.deficientClientSocialInfo.email,
    );
    expect(result).toEqual(mock.deficientClientSocialInfo);
    expect(authClientRepository.update).toHaveBeenCalledWith(
      mock.deficientClientSocialInfo.id,
      updateObject,
    );
  });
});
