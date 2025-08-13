// Jest 모킹을 파일 최상단에 배치 (호이스팅 문제 해결)
const mockPrisma = {
  notification: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
  },
};

jest.mock("@prisma/client", () => {
  const rest = jest.requireActual("@prisma/client");
  return { ...rest, PrismaClient: jest.fn(() => mockPrisma) };
});

// 모킹 후 notificationRepository import
import notificationRepository from "./notification.repository";
import { NotificationType } from "@prisma/client";

describe("NotificationRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getNotification", () => {
    test("알림 ID로 알림을 조회해야 한다", async () => {
      const notificationId = "notification-uuid";
      const fakeNotification = {
        id: notificationId,
        userId: "user-uuid",
        content: "새로운 견적이 도착했습니다",
        type: NotificationType.NEW_ESTIMATE,
        targetId: "estimate-uuid",
        targetUrl: "/estimates/estimate-uuid",
        isRead: false,
        createdAt: new Date(),
      };

      mockPrisma.notification.findUnique.mockResolvedValue(fakeNotification);

      const result = await notificationRepository.getNotification(notificationId);

      expect(mockPrisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
      expect(result).toEqual(fakeNotification);
    });

    test("존재하지 않는 알림 조회 시 null을 반환해야 한다", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      const result = await notificationRepository.getNotification("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getNotifications", () => {
    test("사용자의 알림 목록을 조회해야 한다", async () => {
      const userId = "user-uuid";
      const limit = 6;
      const fakeNotifications = [
        {
          id: "notification1",
          userId,
          content: "새로운 견적이 도착했습니다",
          type: NotificationType.NEW_ESTIMATE,
          targetId: "estimate1",
          targetUrl: "/estimates/estimate1",
          isRead: false,
          createdAt: new Date("2023-12-01"),
        },
        {
          id: "notification2",
          userId,
          content: "견적이 확정되었습니다",
          type: NotificationType.ESTIMATE_CONFIRMED,
          targetId: "estimate2",
          targetUrl: "/estimates/estimate2",
          isRead: true,
          createdAt: new Date("2023-12-02"),
        },
      ];
      const fakeUnreadCount = 1;

      mockPrisma.notification.count.mockResolvedValue(fakeUnreadCount);
      mockPrisma.notification.findMany.mockResolvedValue(fakeNotifications);

      const result = await notificationRepository.getNotifications({
        userId,
        limit,
      });

      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId, isRead: false },
      });
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
      });
      expect(result.notifications).toEqual(fakeNotifications.slice(0, limit));
      expect(result.unreadCount).toBe(fakeUnreadCount);
      expect(result.nextCursor).toBeNull();
    });

    test("커서가 있을 때 다음 페이지를 조회해야 한다", async () => {
      const userId = "user-uuid";
      const limit = 6;
      const cursor = "notification1";
      const fakeNotifications = Array.from({ length: 7 }, (_, i) => ({
        id: `notification${i + 1}`,
        userId,
        content: `알림 ${i + 1}`,
        type: NotificationType.NEW_ESTIMATE,
        targetId: `target${i + 1}`,
        targetUrl: `/targets/target${i + 1}`,
        isRead: false,
        createdAt: new Date(`2023-12-${i + 1}`),
      }));
      const fakeUnreadCount = 7;

      mockPrisma.notification.count.mockResolvedValue(fakeUnreadCount);
      mockPrisma.notification.findMany.mockResolvedValue(fakeNotifications);

      const result = await notificationRepository.getNotifications({
        userId,
        cursor,
        limit,
      });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        skip: 1,
        cursor: { id: cursor },
      });
      expect(result.notifications).toEqual(fakeNotifications.slice(0, limit));
      expect(result.nextCursor).toBe("notification6");
    });

    test("limit이 지정되지 않은 경우 기본값 6을 사용해야 한다", async () => {
      const userId = "user-uuid";
      const fakeNotifications = [
        {
          id: "notification1",
          userId,
          content: "테스트 알림",
          type: NotificationType.NEW_ESTIMATE,
          targetId: "target1",
          targetUrl: "/targets/target1",
          isRead: false,
          createdAt: new Date(),
        },
      ];
      const fakeUnreadCount = 0;

      mockPrisma.notification.count.mockResolvedValue(fakeUnreadCount);
      mockPrisma.notification.findMany.mockResolvedValue(fakeNotifications);

      await notificationRepository.getNotifications({ userId });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 7,
      });
    });
  });

  describe("updateNotification", () => {
    test("알림을 읽음 상태로 업데이트해야 한다", async () => {
      const notificationId = "notification-uuid";
      const fakeUpdatedNotification = {
        id: notificationId,
        userId: "user-uuid",
        content: "테스트 알림",
        type: NotificationType.NEW_ESTIMATE,
        targetId: "target1",
        targetUrl: "/targets/target1",
        isRead: true,
        createdAt: new Date(),
      };

      mockPrisma.notification.update.mockResolvedValue(fakeUpdatedNotification);

      const result = await notificationRepository.updateNotification(notificationId);

      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { isRead: true },
      });
      expect(result).toEqual(fakeUpdatedNotification);
    });
  });

  describe("updateAll", () => {
    test("사용자의 모든 알림을 읽음 상태로 업데이트해야 한다", async () => {
      const userId = "user-uuid";
      const fakeResult = { count: 5 };

      mockPrisma.notification.updateMany.mockResolvedValue(fakeResult);

      const result = await notificationRepository.updateAll(userId);

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual(fakeResult);
    });
  });

  describe("createNotification", () => {
    test("새로운 알림을 생성해야 한다", async () => {
      const notificationData = {
        userId: "user-uuid",
        content: "새로운 견적이 도착했습니다",
        type: NotificationType.NEW_ESTIMATE,
        targetId: "estimate-uuid",
        targetUrl: "/estimates/estimate-uuid",
      };
      const fakeNotification = {
        id: "notification-uuid",
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
      };

      mockPrisma.notification.create.mockResolvedValue(fakeNotification);

      const result = await notificationRepository.createNotification(notificationData);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: notificationData,
      });
      expect(result).toEqual(fakeNotification);
    });
  });

  describe("createMany", () => {
    test("여러 알림을 생성해야 한다", async () => {
      const notificationsData = [
        {
          userId: "user1",
          content: "알림 1",
          type: NotificationType.NEW_ESTIMATE,
          targetId: "target1",
          targetUrl: "/targets/target1",
        },
        {
          userId: "user2",
          content: "알림 2",
          type: NotificationType.ESTIMATE_CONFIRMED,
          targetId: "target2",
          targetUrl: "/targets/target2",
        },
        {
          userId: "user3",
          content: "알림 3",
          type: NotificationType.MOVING_DAY,
          targetId: "target3",
          targetUrl: "/targets/target3",
        },
      ];
      const fakeResult = { count: 3 };

      mockPrisma.notification.createMany.mockResolvedValue(fakeResult);

      const result = await notificationRepository.createMany(notificationsData);

      expect(mockPrisma.notification.createMany).toHaveBeenCalledWith({
        data: notificationsData,
      });
      expect(result).toEqual(fakeResult);
    });
  });
});
