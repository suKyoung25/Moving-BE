import { MoveType } from "@prisma/client";
import profileMoverRespository from "../repositories/profileMover.repository";
import authMoverRepository from "../repositories/authMover.repository";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import profileMoverService from "./profileMover.service";

// 1단계 공통 setUp
jest.mock("../repositories/authMover.repository");
jest.mock("../repositories/profileMover.repository");
jest.mock("../utils/token.util");

const mockFindByRegionByLabel = profileMoverRespository.findRegionByLabel as jest.Mock;
const mockGetMoverById = authMoverRepository.getMoverById as jest.Mock;
const mockModifyMoverProfile = profileMoverRespository.modifyMoverProfile as jest.Mock;
const mockGenerateAccessToken = generateAccessToken as jest.MockedFunction<
  typeof generateAccessToken
>;
const mockGenerateRefreshToken = generateRefreshToken as jest.MockedFunction<
  typeof generateRefreshToken
>;

describe.skip("modifyMoverProfile 함수 정상동작", () => {
  // TODO: 최종 테스트에서 skip 삭제할 것
  // 1단계 공통 setUp
  const mockUser = {
    id: "moving-123-user",
    userId: "mover123",
    email: "moving@test.com",
    image: "image-url",
    name: "김무빙",
    nickName: "무빙",
    career: 5,
    introduction: "안녕하세요 저는 무빙이라고 합니다",
    description: "안녕하세요 저는 무빙이라고 합니다. 잘 부탁드립니다",
    serviceType: ["SMALL", "OFFICE"] as MoveType[],
    serviceArea: ["서울", "경기"],
  };

  const expectedTokenPayload = {
    userId: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    userType: "mover",
    isProfileCompleted: true,
  };

  const updatedMover = { id: "mover123", updated: true };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetMoverById.mockResolvedValue(mockUser);
    mockModifyMoverProfile.mockResolvedValue({ id: "mover123" });
    mockGenerateAccessToken.mockReturnValue("access-token");
    mockGenerateRefreshToken.mockReturnValue("refresh-token");
  });

  test("받은 정보에 서비스 지역이 있으면 지역 매핑 함수를 실행한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockFindByRegionByLabel.mockResolvedValue([{ id: 1 }]);

    // 2단계 exercise - 테스트 실행
    await profileMoverService.modifyMoverProfile(mockUser);

    //3단계 assertion - 결과 검증
    expect(profileMoverRespository.findRegionByLabel).toHaveBeenCalledWith(mockUser);
  });

  test("받은 정보에 서비스 지역이 없으면 지역 매핑 함수가 실행되지 않는다", async () => {
    //  1단계 setUp - 테스트 준비
    const userWithoutArea = {
      ...mockUser,
      serviceArea: [],
    };

    // 2단계 exercise - 테스트 실행
    await profileMoverService.modifyMoverProfile(userWithoutArea);

    //3단계 assertion - 결과 검증
    expect(profileMoverRespository.findRegionByLabel).not.toHaveBeenCalled();
  });

  test("전달받은 id를 통해 기사님을 찾는다", async () => {
    // 2단계 exercise - 테스트 실행
    await profileMoverService.modifyMoverProfile(mockUser);

    //3단계 assertion - 결과 검증
    expect(mockGetMoverById).toHaveBeenCalledWith(mockUser.userId);
  });

  test("기사님이 없으면 null을 반환한다.", async () => {
    //  1단계 setUp - 테스트 준비
    mockGetMoverById.mockResolvedValue(null);

    // 2단계 exercise - 테스트 실행
    const result = await profileMoverService.modifyMoverProfile(mockUser);

    //3단계 assertion - 결과 검증
    expect(result).toBeNull();
  });

  test("기사님 정보로 액세스 토큰 생성 함수가 실행된다", async () => {
    // 2단계 exercise - 테스트 실행
    await profileMoverService.modifyMoverProfile(mockUser);

    //3단계 assertion - 결과 검증
    expect(mockGenerateAccessToken).toHaveBeenCalledWith(expectedTokenPayload);
  });

  test("기사님 정보로 리프레쉬 토큰 생성 함수가 실행된다", async () => {
    // 2단계 exercise - 테스트 실행
    await profileMoverService.modifyMoverProfile(mockUser);

    //3단계 assertion - 결과 검증
    expect(mockGenerateRefreshToken).toHaveBeenCalledWith(expectedTokenPayload);
  });

  test("기사님이 있으면 업데이트한 정보와 토큰들을 반환한다.", async () => {
    //  1단계 setUp - 테스트 준비
    mockFindByRegionByLabel.mockResolvedValue([{ id: 1 }]);
    mockModifyMoverProfile.mockResolvedValue(updatedMover);

    // 2단계 exercise - 테스트 실행
    const result = await profileMoverService.modifyMoverProfile(mockUser);

    //3단계 assertion - 결과 검증
    expect(result).toEqual({
      ...updatedMover,
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });
});
