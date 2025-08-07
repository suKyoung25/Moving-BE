/**
 * prisma 폴더 밑에 mock 폴더를 만들려고 했는데 ts 오류 나서 일단 여기다가 만들어 놓습니다.
 */

import { Provider } from "@prisma/client";

const fullClientInfo = {
  id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
  email: "asdf@example.com",
  name: "그냥사람",
  phone: "01012345678",
  hashedPassword: "asdf1234",
  profileImage: "",
  provider: "LOCAL",
  isProfileCompleted: true,
  serviceType: ["SMALL", "HOME", "OFFICE"],
  livingArea: ["서울", "경기"],
};

// 일반 회원가입 완료 시 생성되는 객체
const deficientClientInfo = {
  id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
  email: "asdf@example.com",
  name: "그냥사람",
  phone: "01012345678",
  hashedPassword: "asdf1234에이것저것덧붙임",
  profileImage: "",
  provider: "LOCAL",
  isProfileCompleted: false,
  serviceType: [],
  livingArea: [],
  userType: "client", // DB 저장 자료에는 없지만 spread 안 하고 그냥 여기에 넣음.
};

const signUpInfo = {
  email: "asdf@example.com",
  name: "그냥사람",
  phone: "01012345678",
  password: "asdf1234",
};

const loginInfo = {
  email: "asdf@example.com",
  hashedPassword: "asdf1234에이것저것덧붙임",
};

// 이름과 전화번호는 안 줄 수도 있어서 선택사항
const socialLoginInfo = {
  email: "asdf@google.com",
  provider: "GOOGLE" as Provider,
  providerId: "googleId",
};

const fullClientSocialInfoBefore = {
  id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
  email: "asdf@google.com",
  provider: "GOOGLE" as Provider,
  providerId: "googleId",
  name: "그냥사람",
  phone: "",
  profileImage: "",
  isProfileCompleted: true,
  serviceType: ["HOME"],
  livingArea: ["서울", "경기"],
};

const fullClientSocialInfoAfter = {
  id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
  email: "asdf@google.com",
  provider: "GOOGLE" as Provider,
  providerId: "googleId",
  name: "그냥사람",
  phone: "01012345678",
  profileImage: "",
  isProfileCompleted: true,
  serviceType: ["HOME", "OFFICE"],
  livingArea: ["서울", "경기"],
};

// 첫 로그인한 상태 = 이름 등 없음
const deficientClientSocialInfo = {
  id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
  email: "asdf@google.com",
  provider: "GOOGLE" as Provider,
  providerId: "googleId",
  name: "",
  phone: "",
  profileImage: "",
  isProfileCompleted: false,
  serviceType: [],
  livingArea: [],
  userType: "client", // DB 저장 자료에는 없지만 spread 안 하고 그냥 여기에 넣음22
};

const clientMock = {
  fullClientInfo,
  deficientClientInfo,
  signUpInfo,
  loginInfo,
  socialLoginInfo,
  fullClientSocialInfoBefore,
  fullClientSocialInfoAfter,
  deficientClientSocialInfo,
};

export default clientMock;
