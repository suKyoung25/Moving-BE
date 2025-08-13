import request from "supertest";
import app from "../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("POST /signup - 회원가입 API 테스트", () => {
  // 전후 데이터 정리
  beforeAll(async () => {
    await prisma.client.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 각 테스트 전에 사용자 데이터 정리 (테스트 격리)
    await prisma.client.deleteMany();
  });

  const payload = {
    email: "asdf@example.com",
    name: "그냥사람",
    phone: "01012345678",
    password: "asdf1234!",
    passwordConfirmation: "asdf1234!",
  };

  test("올바른 데이터를 넣으면 회원가입에 성공한다", async () => {
    // 실행
    const createSignupResponse = await request(app)
      .post("/auth/signup/client")
      .send(payload)
      .expect(201);

    // 검증
    expect(createSignupResponse.body).toHaveProperty("message", "Client 일반 회원가입 성공");
    expect(createSignupResponse.body).toHaveProperty("data.user");
    expect(createSignupResponse.body.data.user.email).toBe("asdf@example.com");
    expect(createSignupResponse.body).toHaveProperty("data.accessToken");
  });

  // test.todo("이미 DB에 있는 이메일로 회원가입 시도하면 오류");
  // test.todo("이미 DB에 있는 전화번호로 회원가입 시도하면 오류");
});

describe("POST /signin - 로그인 API 테스트", () => {
  // 전후 데이터 정리
  beforeAll(async () => {
    await prisma.client.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 각 테스트 전에 사용자 데이터 정리 (테스트 격리)
    await prisma.client.deleteMany();
  });

  const signupPayload = {
    email: "asdf@example.com",
    name: "그냥사람",
    phone: "01012345678",
    password: "asdf1234!",
    passwordConfirmation: "asdf1234!",
  };

  const loginPayload = {
    email: "asdf@example.com",
    password: "asdf1234!",
  };

  test("올바른 데이터를 넣으면 회원가입에 성공한다", async () => {
    // 준비
    await request(app).post("/auth/signup/client").send(signupPayload).expect(201);

    // 실행
    const response = await request(app).post("/auth/signin/client").send(loginPayload).expect(200);

    // 검증
    expect(response.body).toHaveProperty("message", "Client 일반 로그인 성공");
    expect(response.body).toHaveProperty("data.user");
    expect(response.body.data.user.email).toBe("asdf@example.com");
    expect(response.body).toHaveProperty("data.accessToken");
  });

  test("가입하지 않은 이메일로 로그인을 시도하면 404 오류를 낸다", async () => {
    // 실행
    const response = await request(app).post("/auth/signin/client").send(loginPayload).expect(404);

    // 검증
    expect(response.body).toHaveProperty("message", "사용자를 찾을 수 없습니다.");
  });

  test("잘못된 비밀번호로 로그인을 시도하면 409 오류를 낸다", async () => {
    // 준비
    await request(app).post("/auth/signup/client").send(signupPayload).expect(201);

    // 실행
    const response = await request(app)
      .post("/auth/signin/client")
      .send({
        email: "asdf@example.com",
        password: "asdf1234",
      })
      .expect(409);

    // 검증
    expect(response.body).toHaveProperty("message", "잘못된 정보로 인한 요청 실패");
  });
});
