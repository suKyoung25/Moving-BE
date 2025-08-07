import requestRepository from "../repositories/request.repository";
import authClientRepository from "../repositories/authClient.repository";
import notificationService from "../services/notification.service";
import { ErrorMessage } from "../constants/ErrorMessage";
import { BadRequestError, GetReceivedRequestsQuery } from "../types";
import requestService from "./request.service";
import { MoveType, RequestDraft } from "@prisma/client";

jest.mock("../repositories/request.repository");
jest.mock("../repositories/authClient.repository");
jest.mock("../services/notification.service");

// TODO: 테스트 수정 필요
describe("견적 요청 중간 상태 조회 테스트", () => {
  const clientId = "client-id-123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("유저 아이디에 해당하는 견적 요청 초안을 조회하는 함수를 호출하고 결과를 반환한다", async () => {
    const mockDraft: RequestDraft = {
      id: "draft-id-1",
      clientId,
      moveType: MoveType["SMALL"],
      moveDate: new Date(),
      fromAddress: "서울 강남구",
      toAddress: "서울 송파구",
      currentStep: 4,
      updatedAt: new Date(),
    };

    (requestRepository.getRequestDraftById as jest.Mock).mockResolvedValue(mockDraft);

    const result = await requestService.getDraft(clientId);

    expect(requestRepository.getRequestDraftById).toHaveBeenCalledWith(clientId);
    expect(result).toEqual(mockDraft);
  });
});

describe("견적 요청 중간 상태 저장 테스트", () => {
  const clientId = "client-id-456";
  const draftData: Partial<RequestDraft> = {
    moveType: "HOME",
    fromAddress: "부산 해운대구",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("유저의 견적 요청 초안을 업데이트하는 함수를 호출하고 결과를 반환한다", async () => {
    const mockSavedDraft = { ...draftData, clientId };

    (requestRepository.saveRequestDraft as jest.Mock).mockResolvedValue(mockSavedDraft);

    const result = await requestService.saveDraft(clientId, draftData);

    expect(requestRepository.saveRequestDraft).toHaveBeenCalledWith(clientId, draftData);
    expect(result).toEqual(mockSavedDraft);
  });
});

describe("일반 유저 견적 요청 테스트", () => {
  const mockClientId = "client-id-123";
  const mockRequestDto = {
    moveType: MoveType["SMALL"],
    moveDate: new Date(),
    fromAddress: "서울 강남구",
    toAddress: "서울 송파구",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("활성 요청이 있으면 BadRequestError를 던진다", async () => {
    (requestRepository.findPendingRequestById as jest.Mock).mockResolvedValue({ id: "existing" });

    await expect(
      requestService.createRequest({ clientId: mockClientId, request: mockRequestDto }),
    ).rejects.toThrow(new BadRequestError(ErrorMessage.ALREADY_EXIST_REQUEST));

    expect(requestRepository.findPendingRequestById).toHaveBeenCalledWith(mockClientId);
    expect(requestRepository.createEstimateRequest).not.toHaveBeenCalled();
  });

  test("정상 요청일 경우 견적 요청 생성 및 알림 전송", async () => {
    (requestRepository.findPendingRequestById as jest.Mock).mockResolvedValue(null);
    (requestRepository.createEstimateRequest as jest.Mock).mockResolvedValue({
      id: "new-request-1",
    });
    (authClientRepository.findById as jest.Mock).mockResolvedValue({ name: "홍길동" });
    (notificationService.notifyEstimateRequest as jest.Mock).mockResolvedValue(undefined);

    const result = await requestService.createRequest({
      clientId: mockClientId,
      request: mockRequestDto,
    });

    expect(result).toEqual({ id: "new-request-1" });
    expect(requestRepository.createEstimateRequest).toHaveBeenCalledWith(
      mockRequestDto,
      mockClientId,
    );
    expect(notificationService.notifyEstimateRequest).toHaveBeenCalledWith({
      clientName: "홍길동",
      fromAddress: "서울 강남구",
      toAddress: "서울 송파구",
      moveType: "SMALL",
      type: "NEW_ESTIMATE",
      targetId: "new-request-1",
      targetUrl: `/received-requests/new-request-1`,
    });
  });
});

describe("기사님 받은 요청 목록 조회 테스트", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("moverId가 없으면 BadRequestError를 던진다", async () => {
    const query = {
      moveType: "SMALL",
      moverId: undefined,
    } as any;

    await expect(requestService.getReceivedRequests(query)).rejects.toThrow(BadRequestError);
  });

  test("정상적인 파라미터로 repository를 호출한다", async () => {
    const query: GetReceivedRequestsQuery = {
      moverId: "mover123",
      moveType: "SMALL,HOME",
      isDesignated: "true",
      serviceArea: "서울,경기",
      keyword: "강남",
      sort: "moveDate-desc",
      limit: "10",
      cursor: "abc",
    };

    const expectedArgs = {
      moveType: ["SMALL", "HOME"] as MoveType[],
      isDesignated: true,
      serviceAreaList: ["서울", "경기"],
      keyword: "강남",
      sort: "moveDate-desc",
      limit: 10,
      cursor: "abc",
      moverId: "mover123",
    };

    (requestRepository.getFilteredRequests as jest.Mock).mockResolvedValue(["mock"]);

    const result = await requestService.getReceivedRequests(query);

    expect(requestRepository.getFilteredRequests).toHaveBeenCalledWith(expectedArgs);
    expect(result).toEqual(["mock"]);
  });
});

describe("유저 활성 견적 요청 조회 테스트", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("clientId가 없으면 BadRequestError를 던진다", async () => {
    await expect(requestService.getClientActiveRequest("")).rejects.toThrow(
      "clientId가 필요합니다.",
    );
  });

  test("clientId가 있으면 repository를 호출하고 응답을 반환한다", async () => {
    (requestRepository.findPendingRequestById as jest.Mock).mockResolvedValue({ id: "req-1" });

    const result = await requestService.getClientActiveRequest("client-123");

    expect(requestRepository.findPendingRequestById).toHaveBeenCalledWith("client-123");
    expect(result).toEqual({ id: "req-1" });
  });
});

describe("지정 견적 요청 테스트", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("clientId, requestId, moverId 값이 하나라도 없으면 BadRequestError를 던진다", async () => {
    await expect(requestService.designateMover("client", "", "mover")).rejects.toThrow(
      "필수 값 누락",
    );
  });

  test("세 값이 모두 있으면 repository를 호출한다", async () => {
    (requestRepository.designateMover as jest.Mock).mockResolvedValue({ success: true });

    const result = await requestService.designateMover("client-1", "request-1", "mover-1");

    expect(requestRepository.designateMover).toHaveBeenCalledWith(
      "request-1",
      "mover-1",
      "client-1",
    );
    expect(result).toEqual({ success: true });
  });
});
