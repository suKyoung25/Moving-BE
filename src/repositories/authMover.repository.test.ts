//  1단계 setUp - 테스트 준비
const mockPrisma = {
  mover: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

jest.mock("@prisma/client", () => {
  const rest = jest.requireActual("@prisma/client");
  return { ...rest, PrismaClient: jest.fn(() => mockPrisma) };
});

import { Provider } from "@prisma/client";
import authMoverRepository from "./authMover.repository";

// 1단계, 4단계 teardown - 테스트 정리
beforeEach(() => {
  jest.clearAllMocks(); // mock 정리
});

describe("saveMover - 기사님 생성 함수를 테스트한다", () => {
  test("유효한 유저 정보를 보내면 기사님을 생성해 userType과 함께 반환한다", async () => {
    //  1단계 setUp - 테스트 준비
    const mockInput = {
      name: "김무빙",
      email: "moving@test.com",
      phone: "01012345678",
      password: "a1111111!",
      hashedPassword: "hashed1234!", // 해시된 pw
    };

    const mockCreatedMover = {
      id: "mover-1",
      ...mockInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.mover.create.mockResolvedValue(mockCreatedMover);

    // 2단계 exercise - 테스트 실행
    const result = await authMoverRepository.saveMover(mockInput);

    //3단계 assertion - 결과 검증
    expect(mockPrisma.mover.create).toHaveBeenCalledWith({
      data: {
        name: mockInput.name,
        email: mockInput.email,
        phone: mockInput.phone,
        hashedPassword: mockInput.hashedPassword,
      },
    });
    expect(result).toEqual({ ...mockCreatedMover, userType: "mover" });
  });
});

describe("deleteMoverById - 아이디로 기사님을 삭제하는 함수를 테스트한다", () => {
  test("유효한 기사님 Id를 받으면 기사님 정보를 삭제한다", async () => {
    //  1단계 setUp - 테스트 준비
    const moverId = "mover-1";

    const mockDeletedMover = {
      id: moverId,
      name: "김무빙",
      email: "moving@test.com",
      phone: "01012345678",
      hashedPassword: "hashed1234!",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.mover.delete.mockResolvedValue(mockDeletedMover);

    // 2단계 exercise - 테스트 실행
    const result = await authMoverRepository.deleteMoverById(moverId);

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.delete).toHaveBeenCalledWith({
      where: { id: moverId },
    });

    expect(result).toEqual(mockDeletedMover);
  });
});

describe("getMoverById - 아이디로 기사님을 조회하는 함수를 테스트한다", () => {
  test("유효한 id를 받으면 기사님 정보를 반환한다", async () => {
    //  1단계 setUp - 테스트 준비
    const moverId = "mover-1";

    const mockMover = {
      id: moverId,
      name: "김무빙",
      email: "moving@test.com",
      phone: "01012345678",
      hashedPassword: "hashed1234!",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.mover.findUnique.mockResolvedValue(mockMover);

    // 2단계 exercise - 테스트 실행
    const result = await authMoverRepository.getMoverById(moverId);

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.findUnique).toHaveBeenCalledWith({
      where: { id: moverId },
    });

    expect(result).toEqual(mockMover);
  });
});

describe("getMoverByEmail - 이메일로 기사님을 조회하는 함수를 테스트한다", () => {
  test("유효한 이메일을 받으면 userType과 기사님 정보를 반환한다", async () => {
    //  1단계 setUp - 테스트 준비
    const email = "moving@test.com";

    const mockMover = {
      id: "mover-1",
      name: "김무빙",
      email,
      phone: "01012345678",
      hashedPassword: "hashed1234!",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.mover.findUnique.mockResolvedValue(mockMover);

    // 2단계 exercise - 테스트 실행
    const result = await authMoverRepository.getMoverByEmail(email);

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.findUnique).toHaveBeenCalledWith({
      where: { email },
    });

    expect(result).toEqual({ ...mockMover, userType: "mover" });
  });

  test("유효하지 않은 이메일을 받으면 null값을 반환한다", async () => {
    //  1단계 setUp - 테스트 준비
    const email = "not-exist@test.com";

    mockPrisma.mover.findUnique.mockResolvedValue(null);

    // 2단계 exercise - 테스트 실행
    const result = await authMoverRepository.getMoverByEmail(email);

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.findUnique).toHaveBeenCalledWith({
      where: { email },
    });

    expect(result).toBeNull();
  });
});

describe("getMoverByPhone - 전화번호로 기사님을 조회하는 함수를 테스트한다", () => {
  test("받은 전화번호가 없으면 null값을 반환한다.", async () => {
    // 2단계 exercise - 테스트 실행
    const result = await authMoverRepository.getMoverByPhone("");

    // 3단계 assertion - 결과 검증
    expect(result).toBeNull();

    expect(mockPrisma.mover.findUnique).not.toHaveBeenCalled();
  });

  test("유효한 전화번를 받으면 기사님 정보를 반환한다.", async () => {
    //  1단계 setUp - 테스트 준비
    const phone = "01012345678";

    const mockMover = {
      id: "mover-1",
      name: "김무빙",
      email: "moving@test.com",
      phone,
      hashedPassword: "hashed1234!",
    };

    mockPrisma.mover.findUnique.mockResolvedValue(mockMover);

    // 2단계 exercise - 테스트 실행
    const result = await authMoverRepository.getMoverByPhone(phone);

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.findUnique).toHaveBeenCalledWith({
      where: { phone },
    });

    expect(result).toEqual(mockMover);
  });
});

describe("createOrUpdate - (소셜) 요청받은 정보로 기사님 정보를 생성하거나 업데이트하는 함수를 테스트한다", () => {
  test("유효한 아이디를 받으면 기사님 정보를 생성한다", async () => {
    //  1단계 setUp - 테스트 준비
    const data = {
      provider: "GOOGLE" as Provider,
      providerId: "google-123",
      email: "new@test.com",
      name: "신규무빙",
      phone: "01012345678",
    };

    const mockCreatedMover = {
      id: "mover-1",
      ...data,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.mover.upsert.mockResolvedValue(mockCreatedMover);

    // 2단계 exercise - 테스트 실행
    const result = await authMoverRepository.createOrUpdate(data);

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.upsert).toHaveBeenCalledWith({
      where: { provider_providerId: { provider: data.provider, providerId: data.providerId } },
      update: { email: data.email, name: data.name },
      create: { ...data },
    });

    expect(result).toEqual({ ...mockCreatedMover, userType: "mover" });
  });

  test("유효한 아이디를 받으면 기사님 정보를 갱신한다", async () => {
    //  1단계 setUp - 테스트 준비
    const data = {
      provider: "GOOGLE" as Provider,
      providerId: "google-456",
      email: "update@test.com",
      name: "수정무빙",
      phone: "01087654321",
    };

    const mockUpdatedMover = {
      id: "mover-2",
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.mover.upsert.mockResolvedValue(mockUpdatedMover);

    // 2단계 exercise - 테스트 실행
    const result = await authMoverRepository.createOrUpdate(data);

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.upsert).toHaveBeenCalledWith({
      where: { provider_providerId: { provider: data.provider, providerId: data.providerId } },
      update: { email: data.email, name: data.name },
      create: { ...data },
    });

    expect(result).toEqual({ ...mockUpdatedMover, userType: "mover" });
  });
});
