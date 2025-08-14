// 1단계 setUp - 테스트 준비
const mockPrisma = {
  mover: {
    update: jest.fn(),
    findFirst: jest.fn(),
  },
};

jest.mock("@prisma/client", () => {
  const rest = jest.requireActual("@prisma/client");
  return { ...rest, PrismaClient: jest.fn(() => mockPrisma) };
});

import accountMoverRepository from "./accountMover.repository";

// 1단계, 4단계 teardown - 테스트 정리
beforeEach(() => {
  jest.clearAllMocks(); // mock 초기화
});

describe("patchMoverAccount - 기사님 정보를 수정하는 함수를 테스트한다.", () => {
  test("hashedNewPassword 없이 수정할 수 있다", async () => {
    //  1단계 setUp - 테스트 준비
    const patchData = {
      moverId: "mover-1",
      name: "수정무빙",
      email: "update@test.com",
      phone: "01011112222",
    };

    const mockUpdatedMover = {
      id: patchData.moverId,
      ...patchData,
      hashedPassword: "oldHashedPassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.mover.update.mockResolvedValue(mockUpdatedMover);

    // 2단계 exercise - 테스트 실행
    const result = await accountMoverRepository.patchMoverAccount(patchData);

    //3단계 assertion - 결과 검증
    expect(mockPrisma.mover.update).toHaveBeenCalledWith({
      where: { id: patchData.moverId },
      data: {
        name: patchData.name,
        email: patchData.email,
        phone: patchData.phone,
      },
    });

    expect(result).toEqual(mockUpdatedMover);
  });

  test("hashedNewPassword 포함하여 수정할 수 있다.", async () => {
    //  1단계 setUp - 테스트 준비
    const patchData = {
      moverId: "mover-2",
      name: "수정무빙2",
      email: "update2@test.com",
      phone: "01022223333",
      hashedNewPassword: "newHashedPassword",
    };

    const mockUpdatedMover = {
      id: patchData.moverId,
      ...patchData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.mover.update.mockResolvedValue(mockUpdatedMover);

    // 2단계 exercise - 테스트 실행
    const result = await accountMoverRepository.patchMoverAccount(patchData);

    //3단계 assertion - 결과 검증
    expect(mockPrisma.mover.update).toHaveBeenCalledWith({
      where: { id: patchData.moverId },
      data: {
        name: patchData.name,
        email: patchData.email,
        phone: patchData.phone,
        hashedPassword: patchData.hashedNewPassword,
      },
    });

    expect(result).toEqual(mockUpdatedMover);
  });
});

describe("findMoverByPhoneExcludingSelf - 본인 외 사용중인 전화번호인지 확인하는 함수를 테스트한다.", () => {
  test("본인을 제외하고 존재하는 전화번호면 true 반환", async () => {
    //  1단계 setUp - 테스트 준비
    mockPrisma.mover.findFirst.mockResolvedValue({ id: "mover-2" });

    // 2단계 exercise - 테스트 실행
    const result = await accountMoverRepository.findMoverByPhoneExcludingSelf(
      "01011112222",
      "mover-1",
    );

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.findFirst).toHaveBeenCalledWith({
      where: { phone: "01011112222", NOT: { id: "mover-1" } },
    });
    expect(result).toBe(true);
  });

  test("본인을 제외하고 존재하는 전화번호면 false 반환", async () => {
    //  1단계 setUp - 테스트 준비
    mockPrisma.mover.findFirst.mockResolvedValue(null);

    // 2단계 exercise - 테스트 실행
    const result = await accountMoverRepository.findMoverByPhoneExcludingSelf(
      "01011112222",
      "mover-1",
    );

    // 3단계 assertion - 결과 검증
    expect(result).toBe(false);
  });
});

describe("findMoverByEmailExcludingSelf - 본인 외 사용중인 이메일인지 확인하는 함수를 테스트한다.", () => {
  test("본인을 제외하고 존재하는 이메일이면 true 반환", async () => {
    //  1단계 setUp - 테스트 준비
    mockPrisma.mover.findFirst.mockResolvedValue({ id: "mover-2" });

    // 2단계 exercise - 테스트 실행
    const result = await accountMoverRepository.findMoverByEmailExcludingSelf(
      "test@test.com",
      "mover-1",
    );

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.findFirst).toHaveBeenCalledWith({
      where: { email: "test@test.com", NOT: { id: "mover-1" } },
    });
    expect(result).toBe(true);
  });

  test("본인을 제외하고 존재하지 않는 이메일이면 false 반환", async () => {
    //  1단계 setUp - 테스트 준비
    mockPrisma.mover.findFirst.mockResolvedValue(null);

    // 2단계 exercise - 테스트 실행
    const result = await accountMoverRepository.findMoverByEmailExcludingSelf(
      "test@test.com",
      "mover-1",
    );

    // 3단계 assertion - 결과 검증
    expect(result).toBe(false);
  });
});

describe("findMoverByNickNameExcludingSelf - 본인 외 사용중인 닉네임이 있는지 확인하는 함수를 테스트한다.", () => {
  test("본인을 제외하고 존재하는 닉네임이면 true 반환", async () => {
    //  1단계 setUp - 테스트 준비
    mockPrisma.mover.findFirst.mockResolvedValue({ id: "mover-2" });

    // 2단계 exercise - 테스트 실행
    const result = await accountMoverRepository.findMoverByNickNameExcludingSelf(
      "닉네임1",
      "mover-1",
    );

    // 3단계 assertion - 결과 검증
    expect(mockPrisma.mover.findFirst).toHaveBeenCalledWith({
      where: { nickName: "닉네임1", NOT: { id: "mover-1" } },
    });
    expect(result).toBe(true);
  });

  test("본인을 제외하고 존재하지 않는 닉네임이면 false 반환", async () => {
    //  1단계 setUp - 테스트 준비
    mockPrisma.mover.findFirst.mockResolvedValue(null);

    // 2단계 exercise - 테스트 실행
    const result = await accountMoverRepository.findMoverByNickNameExcludingSelf(
      "닉네임1",
      "mover-1",
    );

    // 3단계 assertion - 결과 검증
    expect(result).toBe(false);
  });
});
