import mock from "../constants/client.mock";

// 의존성 제거 용도로 mock 함수 만듦
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  };
});

// 프리즈마 가져옴
const mockPrisma = {
  client: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

// import 순서 변경 (위에 쓰면 적용 안 됨)
import authClientRepository from "./authClient.repository";

/**
 * - 4단계는 없는데, 이유는 준비 단계에서 clearAllMocks를 하기 때문
 * - 유효성 검사로 이상한 id 등이 들어올 일은 방지했으므로 틀린 값 넣는 건 생략
 */

describe("findById 검사", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("올바른 id를 넣으면 Client 객체를 반환한다.", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue(mock.fullClientInfo);

    // 2. 실행
    const result = await authClientRepository.findById("fc6796df-4ed0-46db-a1d7-7c28ce49979d");

    // 3. 검증
    expect(result).toEqual(mock.fullClientInfo);
    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d" },
    });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledTimes(1);
  });

  test("사용자 객체에 id가 없으면 함수를 반환하지 않는다.", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue(null);

    // 2. 실행
    const result = await authClientRepository.findById(undefined as any);

    // 3. 검증
    expect(result).toBeNull();
    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: undefined },
    });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledTimes(1);
  });
});

describe("findByEmailRaw 검사", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("올바른 이메일을 넣으면 Client 객체를 반환한다.", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue(mock.fullClientInfo);

    // 2. 실행
    const result = await authClientRepository.findByEmailRaw("asdf@example.com");

    // 3. 검증
    expect(result).toEqual(mock.fullClientInfo);
    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { email: "asdf@example.com" },
    });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledTimes(1);
  });

  test("사용자 객체에 이메일이 없으면 함수를 반환하지 않는다.", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue(null);

    // 2. 실행
    const result = await authClientRepository.findByEmailRaw(undefined as any);

    // 3. 검증
    expect(result).toBeNull();
    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { email: undefined },
    });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledTimes(1);
  });
});

describe("findByPhone 검사", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("올바른 전화번호를 넣으면 Client 객체를 반환한다.", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue(mock.fullClientInfo);

    // 2. 실행
    const result = await authClientRepository.findByPhone("01012345678");

    // 3. 검증
    expect(result).toEqual(mock.fullClientInfo);
    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { phone: "01012345678" },
    });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledTimes(1);
  });

  test("사용자 객체에 전화번호가 없으면 함수를 반환하지 않는다.", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue(null);

    // 2. 실행
    const result = await authClientRepository.findByPhone(undefined as any);

    // 3. 검증
    expect(result).toBeNull();
  });
});

describe("DB에 회원가입 자료 넣는 작업 검증", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("회원가입 성공", async () => {
    // 1. 준비
    const mockData = {
      ...mock.signUpInfo,
      id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
      userType: "client",
    };
    mockPrisma.client.create.mockResolvedValue(mockData);

    // 2. 실행
    const result = await authClientRepository.create(mock.signUpInfo);

    // 3. 검증: id는 필요 없으므로 equal 말고 matchObject 씀
    expect(result).toMatchObject({ ...mock.signUpInfo, userType: "client" });
    expect(mockPrisma.client.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.client.create).toHaveBeenCalledWith({
      data: {
        name: mock.signUpInfo.name,
        email: mock.signUpInfo.email,
        phone: mock.signUpInfo.phone,
        hashedPassword: mock.signUpInfo.password,
      },
    });
  });
});

describe("findByEmail 검증", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("올바른 이메일을 넣으면 Client 정보와 userType을 반환한다.", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue({
      ...mock.fullClientInfo,
      userType: "client",
    });

    // 2. 실행
    const result = await authClientRepository.findByEmail("asdf@example.com");

    // 3. 검증
    expect(result).toEqual({ ...mock.fullClientInfo, userType: "client" });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { email: "asdf@example.com" },
    });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledTimes(1);
  });

  test("이메일이 없으면 함수를 반환하지 않는다.", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue(null);

    // 2. 실행
    const result = await authClientRepository.findByEmail(undefined as any);

    // 3. 검증
    expect(result).toBeNull();
    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
      where: { email: undefined },
    });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledTimes(1);
  });
});

describe("DB에 소셜 로그인 자료 넣는 것 검증", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("provider와 providerId, userType을 포함해 반환한다.", async () => {
    // 1. 준비
    // 이름과 전화번호는 안 줄 수도 있어서 선택사항
    const mockData = {
      ...mock.socialLoginInfo,
      id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
      userType: "client",
    };
    mockPrisma.client.create.mockResolvedValue(mockData);

    // 2. 실행
    const result = await authClientRepository.save(mock.socialLoginInfo);

    // 검증
    expect(result).toMatchObject({ ...mock.socialLoginInfo, userType: "client" });
    expect(mockPrisma.client.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.client.create).toHaveBeenCalledWith({
      data: {
        email: mock.socialLoginInfo.email,
        provider: mock.socialLoginInfo.provider,
        providerId: mock.socialLoginInfo.providerId,
      },
    });
  });
});

describe("DB에 소셜 로그인 자료 넣는 것 검증", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 이름 안 넣으면 "카카오"가 들어가게 해놨고, 전화번호는 필수
  test("프로필 수정 (phone, serviceType) = 성공", async () => {
    // 1. 준비
    const mockBefore = mock.fullClientSocialInfoBefore;
    const updateData = { phone: "01012345678", serviceType: ["HOME", "OFFICE"] };
    const mockAfter = { ...mockBefore, ...updateData };
    mockPrisma.client.update.mockResolvedValue(mockAfter);

    // 2. 실행
    const result = await authClientRepository.update(mockBefore.id, updateData as any);

    // 3. 검증
    expect(result).toMatchObject({ ...mockAfter, userType: "client" });
    expect(mockPrisma.client.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.client.update).toHaveBeenCalledWith({
      where: { id: mockBefore.id },
      data: updateData,
    });
  });

  // 로그인한 상태니까 id가 안 들어갈 일은 없어서 해당 검사는 생략.
  // 이름이 바뀌는 문제는 미들웨어 단위에서 처리해서 생략.
  // 미로그인했을 때는 routing guard 처리 해서 페이지에 접속 못 하므로 생략.
});
