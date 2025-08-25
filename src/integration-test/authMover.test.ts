import request from "supertest";
import prisma from "../configs/prisma.config";
import app from "../app";
import bcrypt from "bcrypt";

describe("POST /auth/signup/mover - 기사님 회원가입 API 테스트", () => {
  // 1단계 - setUp 테스트용 사용자 데이터
  const validUser = {
    name: "김무빙",
    email: "tmover111@gmail.com",
    phone: "01011112222",
    password: "a1111111!",
    passwordConfirmation: "a1111111!",
  };

  // 4단계 - teardown
  afterAll(async () => {
    // 테스트용 DB 초기화
    await prisma.mover.deleteMany({ where: { email: validUser.email } });
  });

  test("유효한 데이터면 기사님 회원가입 시 성공한다", async () => {
    // 2단계 exercise - 테스트 실행
    const response = await request(app).post("/auth/signup/mover").send({
      name: validUser.name,
      email: validUser.email,
      phone: validUser.phone,
      password: validUser.password, // 요청은 평문으로
      passwordConfirmation: validUser.passwordConfirmation,
    });

    //3단계 assertion - 결과 검증
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("refreshToken");
  });

  test("DB와 대조하여 잘못된 데이터면 기사님 회원가입 시 실패한다", async () => {
    // 2단계 exercise - 테스트 실행
    const response = await request(app).post("/auth/signup/mover").send({
      name: "abcde",
      email: "abcd@naver",
      phone: "010",
      password: "a123",
      passwordConfirmation: "a123",
    });

    //3단계 assertion - 결과 검증
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message", "잘못된 정보로 인한 요청 실패");
  });
});

describe("POST /auth/signin/mover - 기사님 로그인 API 테스트", () => {
  // 1단계 - setUp 테스트용 사용자 데이터
  const validUser = {
    email: "tmover111@gmail.com",
    password: "a1111111!",
  };

  beforeAll(async () => {
    // 테스트용 DB에 테스트용 유저 생성
    const hashed = await bcrypt.hash(validUser.password, 10);
    await prisma.mover.create({
      data: {
        email: validUser.email,
        hashedPassword: hashed, // db에는 해시된 값으로 저장
      },
    });
  });

  // 4단계 - teardown
  afterAll(async () => {
    // 테스트용 DB 초기화
    await prisma.mover.deleteMany({ where: { email: validUser.email } });
  });

  test("유효한 데이터면 기사님 로그인 시 성공한다", async () => {
    // 2단계 exercise - 테스트 실행
    const response = await request(app).post("/auth/signin/mover").send({
      email: validUser.email,
      password: validUser.password, // 요청은 평문으로
    });

    //3단계 assertion - 결과 검증
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("refreshToken");
  });

  test("DB와 대조하여 잘못된 데이터면 기사님 로그인 시 실패한다", async () => {
    // 2단계 exercise - 테스트 실행
    const response = await request(app).post("/auth/signin/mover").send({
      email: "wrongEmail@etest", // 잘못된 이메일 형식
      password: "wrongPassword", // 잘못된 비밀번호 형식
    });

    //3단계 assertion - 결과 검증
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message", "잘못된 정보로 인한 요청 실패");
  });
});
