import { profileMock } from "../mocks/client.mock";

// 프리즈마 가져오기
const mockPrisma = {
  client: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock("@prisma/client", () => {
  const rest = jest.requireActual("@prisma/client");
  return { ...rest, PrismaClient: jest.fn(() => mockPrisma) };
});

// import 순서 변경
import clientRepository from "./client.repository";
import { MoveType } from "@prisma/client";

// mockData 목록
const id = "fc6796df-4ed0-46db-a1d7-7c28ce49979d";
const nonProfileDataInDB = profileMock.deficientDataInDB; // 프로필 등록 전(DB)
const profileOkDataInDB = profileMock.fullDataInDB; // 프로필 등록 후(DB)
const profileData = profileMock.profileInfo; // 프로필 넣기
const nonProfileDataToFE = profileMock.deficientDataToFE; // 프로필 등록 전(FE)
const profileOKDataToFE = profileMock.fullDataToFE; // 프로필 등록 후(FE)
const filteredNonProfileDataInDB = profileMock.filteredDeficientDataInDB; // 비밀번호x
const filteredprofileOkDataInDB = profileMock.filteredFullDataInDB; // 비밀번호x
const profileDataChanged = profileMock.fullDataInDBChanged;
const profileImageEdit = profileMock.profileImageEdit;

/**
 * 여기서부터 검사 시작
 */
describe("findById 검사", () => {
  // 0. 준비
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("올바른 id를 넣으면 사용자 정보를 반환한다. (프로필 등록 전)", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue(nonProfileDataInDB);

    // 2. 실행
    const result = await clientRepository.findById(id);

    // 3. 검증
    expect(result).toStrictEqual({ ...filteredNonProfileDataInDB, userType: "client" });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        include: { livingArea: { select: { regionName: true } } },
      }),
    );
  });

  test("올바른 id를 넣으면 사용자 정보를 반환한다. (프로필 등록 후)", async () => {
    // 1. 준비
    mockPrisma.client.findUnique.mockResolvedValue(profileOkDataInDB);

    // 2. 실행
    const result = await clientRepository.findById(id);

    // 3. 검증
    expect(result).toStrictEqual({ ...filteredprofileOkDataInDB, userType: "client" });
    expect(mockPrisma.client.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.client.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        include: { livingArea: { select: { regionName: true } } },
      }),
    );
  });
});

describe("repository - 프로필 생성 검증", () => {
  test("이미지, 이용 서비스, 사는 지역이 전부 다 갱신된다", async () => {
    // 1. 준비
    mockPrisma.client.update.mockResolvedValue(profileOkDataInDB);

    // 2. 실행
    const result = await clientRepository.create(id, profileData);

    // 3. 검증
    expect(result).toStrictEqual({ ...profileOkDataInDB, userType: "client" });
    expect(mockPrisma.client.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.client.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        profileImage: "이미지주소",
        serviceType: [MoveType.SMALL, MoveType.HOME, MoveType.OFFICE],
        livingArea: { connect: [{ regionName: "서울" }, { regionName: "경기" }] },
        isProfileCompleted: true,
      },
    });
  });
});

describe.only("repository - 프로필 수정 검증", () => {
  test("이미지 바꿈", async () => {
    // 1. 준비
    mockPrisma.client.update.mockResolvedValue(profileDataChanged);

    // 2. 실행
    const result = await clientRepository.update(id, profileImageEdit);

    // 3. 검증
    expect(result).toStrictEqual({ ...profileDataChanged, userType: "client" });
    expect(mockPrisma.client.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.client.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        profileImage: "이미지주소를바꿈",
      },
    });
  });
});
