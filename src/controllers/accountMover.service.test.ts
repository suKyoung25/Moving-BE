import accountMoverRepository from "../repositories/accountMover.repository";
import accountMoverService from "../services/accountMover.service";
import { EditMoverAccount } from "../types";
import { hashPassword } from "../utils/auth.util";

// 1단계 - 공통 setUp
jest.mock("../repositories/accountMover.repository");
jest.mock("../utils/auth.util");

const mockPatchMoverAccount = accountMoverRepository.patchMoverAccount as jest.Mock;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe("accountMover.service.test.ts 파일을 테스트한다", () => {
  // 1단계 - 공통 setUp
  const mockEditData: EditMoverAccount = {
    moverId: "mover-123-user",
    name: "김기사",
    email: "mover@test.com",
    phone: "01012345678",
    newPassword: "newPassword123",
  };

  const mockUpdatedMover = {
    id: "mover-123-user",
    name: "김기사",
    email: "mover@test.com",
    phone: "01012345678",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockHashPassword.mockResolvedValue("hashed-password");
    mockPatchMoverAccount.mockResolvedValue(mockUpdatedMover);
  });

  test("새 비밀번호가 있으면 hashPassword 함수를 실행한다", async () => {
    // 2단계 exercise - 테스트 실행
    await accountMoverService.patchMoverAccount(mockEditData);

    // 3단계 assertion - 결과 검증
    expect(mockHashPassword).toHaveBeenCalledWith(mockEditData.newPassword);
  });

  test("새 비밀번호가 없으면 hashPassword 함수를 실행하지 않는다", async () => {
    // 1단계 setUp - 테스트 준비
    const editDataWithoutPassword: EditMoverAccount = {
      ...mockEditData,
      newPassword: undefined,
    };

    // 2단계 exercise - 테스트 실행
    await accountMoverService.patchMoverAccount(editDataWithoutPassword);

    // 3단계 assertion - 결과 검증
    expect(mockHashPassword).not.toHaveBeenCalled();
  });

  test("받은 정보와 해시된 비밀번호로 유저 정보 갱신 함수를 호출한다", async () => {
    // 2단계 exercise - 테스트 실행
    await accountMoverService.patchMoverAccount(mockEditData);

    // 3단계 assertion - 결과 검증
    expect(mockPatchMoverAccount).toHaveBeenCalledWith({
      ...mockEditData,
      hashedNewPassword: "hashed-password",
    });
  });

  test("업데이트된 유저 정보를 반환한다.", async () => {
    // 2단계 exercise - 테스트 실행
    const result = await accountMoverService.patchMoverAccount(mockEditData);

    // 3단계 assertion - 결과 검증
    expect(result).toEqual({
      updatedMoverAccount: {
        moverId: mockUpdatedMover.id,
        name: mockUpdatedMover.name,
        email: mockUpdatedMover.email,
        phone: mockUpdatedMover.phone,
      },
    });
  });
});
