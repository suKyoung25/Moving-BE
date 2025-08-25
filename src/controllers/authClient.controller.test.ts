import mock from "../mocks/client.mock";
import authClientController from "./authClient.controller";
import authClientService from "../services/authClient.service";

// 의존성 제거
jest.mock("../services/authClient.service", () => ({
  create: jest.fn(),
  loginWithLocal: jest.fn(),
  remove: jest.fn(),
}));

describe("Controller - 회원가입", () => {
  test("회원가입 성공 시 올바른 응답을 반환한다.", async () => {
    // 1. 준비
    const mockRequest = {
      body: {
        email: "asdf@example.com",
        name: "그냥사람",
        phone: "01012345678",
        password: "asdf1234",
        passwordConfirmation: "asdf1234",
      },
    } as any;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const mockNext = jest.fn();

    const mockData = {
      accessToken: "accessToken이다",
      refreshToken: "refreshToken이다",
      user: { name: "그냥사람" },
    };

    (authClientService.create as jest.Mock).mockResolvedValue(mockData);

    // 2. 실행
    await authClientController.signUp(mockRequest, mockResponse, mockNext);

    // 3. 검증
    expect(authClientService.create).toHaveBeenCalledWith(mockRequest.body);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Client 일반 회원가입 성공",
      data: mockData,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe("Controller - 로그인", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("로그인 성공 시 토큰을 포함해 올바른 응답을 반환한다.", async () => {
    // 1. 준비
    const mockRequest = {
      body: {
        email: "asdf@example.com",
        password: "asdf1234",
      },
    } as any;
    const returnData = {
      accessToken: "accessToken이다",
      refreshToken: "refreshToken이다",
      user: mock.fullClientInfo,
    } as any;

    const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const mockNext = jest.fn();

    const mockServiceLoginFn = authClientService.loginWithLocal as jest.Mock;
    mockServiceLoginFn.mockResolvedValue(returnData);

    // 2. 실행
    await authClientController.login(mockRequest, mockResponse, mockNext);

    // 3. 검증
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Client 일반 로그인 성공",
      data: returnData,
    });
    expect(authClientService.loginWithLocal).toHaveBeenCalledWith({
      email: "asdf@example.com",
      hashedPassword: "asdf1234", // 컨트롤러가 변환해서 넘김
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
