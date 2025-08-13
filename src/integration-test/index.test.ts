import "./app.test";
import "./authClient.test";
import "./authMover.test";
import "./favorite.test";
import "./review.test";
import prisma from "../configs/prisma.config";

afterAll(async () => {
  console.log("모든 테스트 종료 - DB 연결 해제 중...");
  await prisma.$disconnect();
});
