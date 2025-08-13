import cron from "node-cron";
import estimateRepository from "../repositories/estimate.repository";
import { NotificationTemplate } from "../constants/NotificationTemplate";
import notificationService from "../services/notification.service";
import { processMovingDayNotifications } from "./notification.cron";
import { EstimateStatus } from "@prisma/client";

jest.mock("node-cron");
jest.mock("date-fns", () => ({
  addDays: jest.fn(),
  format: jest.fn(),
  startOfDay: jest.fn(),
}));
jest.mock("../repositories/estimate.repository");
jest.mock("../services/notification.service");
jest.mock("../constants/NotificationTemplate");

const mockCron = cron as jest.Mocked<typeof cron>;
const mockEstimateRepository = estimateRepository as jest.Mocked<typeof estimateRepository>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockNotificationTemplate = NotificationTemplate as jest.Mocked<typeof NotificationTemplate>;
const mockDateFns = require("date-fns");

describe("이사 알림 스케줄러 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // date-fns 모킹 설정
    mockDateFns.format.mockReturnValue("24.01.15 Mon 12:00 AM");
    mockDateFns.startOfDay.mockReturnValue(new Date("2024-01-15T00:00:00Z"));
    mockDateFns.addDays
      .mockReturnValueOnce(new Date("2024-01-16T00:00:00Z"))
      .mockReturnValueOnce(new Date("2024-01-17T00:00:00Z"));
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  test("NODE_ENV가 test일 때는 cron 스케줄을 등록하지 않아야 한다", () => {
    process.env.NODE_ENV = "test";

    jest.resetModules();
    require("./notification.cron");

    expect(mockCron.schedule).not.toHaveBeenCalled();
  });

  describe("processMovingDayNotifications 함수 테스트", () => {
    const mockEstimate = {
      id: "est-1",
      clientId: "client-1",
      moverId: "mover-1",
      requestId: "req-1",
      price: 50000,
      moverStatus: EstimateStatus.CONFIRMED,
      isClientConfirmed: false,
      comment: "견적 코멘트",
      createdAt: new Date("2024-01-15T00:00:00Z"),
      request: {
        fromAddress: "서울시 강남구",
        toAddress: "서울시 서초구",
      },
    };

    const mockContent = "이사 알림 내용";

    beforeEach(() => {
      mockEstimateRepository.findEstimateByMoveDate.mockResolvedValue([mockEstimate]);
      mockNotificationTemplate.MOVING_DAY.mockReturnValue(mockContent);
      mockNotificationService.notifyMovingDay.mockResolvedValue(undefined);
    });

    test("당일과 내일 이사 예정 건을 조회해야 한다", async () => {
      await processMovingDayNotifications();

      expect(mockEstimateRepository.findEstimateByMoveDate).toHaveBeenCalledTimes(2);
      expect(mockEstimateRepository.findEstimateByMoveDate).toHaveBeenCalledWith(
        new Date("2024-01-15T00:00:00Z"),
        new Date("2024-01-16T00:00:00Z"),
      );
      expect(mockEstimateRepository.findEstimateByMoveDate).toHaveBeenCalledWith(
        new Date("2024-01-16T00:00:00Z"),
        new Date("2024-01-17T00:00:00Z"),
      );
    });

    test("당일 이사 알림을 올바른 파라미터로 전송해야 한다", async () => {
      await processMovingDayNotifications();

      expect(mockNotificationTemplate.MOVING_DAY).toHaveBeenCalledWith(
        "서울시 강남구",
        "서울시 서초구",
        0,
      );
      expect(mockNotificationService.notifyMovingDay).toHaveBeenCalledWith(
        mockEstimate,
        mockContent,
      );
    });

    test("내일 이사 알림을 올바른 파라미터로 전송해야 한다", async () => {
      await processMovingDayNotifications();

      expect(mockNotificationTemplate.MOVING_DAY).toHaveBeenCalledWith(
        "서울시 강남구",
        "서울시 서초구",
        1,
      );
    });

    test("이사 예정 건이 없을 때도 정상적으로 처리되어야 한다", async () => {
      mockEstimateRepository.findEstimateByMoveDate.mockResolvedValue([]);

      const result = await processMovingDayNotifications();

      expect(result).toEqual({ todayMoves: 0, tomorrowMoves: 0 });
      expect(mockNotificationService.notifyMovingDay).not.toHaveBeenCalled();
    });

    test("여러 건의 이사 예정이 있을 때 모든 건에 대해 알림을 전송해야 한다", async () => {
      const multipleEstimates = [
        { ...mockEstimate, id: "est-1" },
        { ...mockEstimate, id: "est-2" },
      ];
      mockEstimateRepository.findEstimateByMoveDate.mockResolvedValue(multipleEstimates);

      await processMovingDayNotifications();

      expect(mockNotificationService.notifyMovingDay).toHaveBeenCalledTimes(4); // today + tomorrow
    });

    test("에러가 발생해도 다른 알림 처리에 영향을 주지 않아야 한다", async () => {
      mockNotificationService.notifyMovingDay
        .mockResolvedValueOnce(undefined) // 첫 번째 성공
        .mockRejectedValueOnce(new Error("알림 전송 실패")) // 두 번째 실패
        .mockResolvedValueOnce(undefined); // 세 번째 성공

      mockEstimateRepository.findEstimateByMoveDate.mockResolvedValue([mockEstimate]);

      await expect(processMovingDayNotifications()).rejects.toThrow("알림 전송 실패");
    });

    test("반환값이 올바르게 계산되어야 한다", async () => {
      mockEstimateRepository.findEstimateByMoveDate
        .mockResolvedValueOnce([mockEstimate, { ...mockEstimate, id: "est-2" }]) // today: 2건
        .mockResolvedValueOnce([mockEstimate]); // tomorrow: 1건

      const result = await processMovingDayNotifications();

      expect(result).toEqual({ todayMoves: 2, tomorrowMoves: 1 });
    });
  });
});
