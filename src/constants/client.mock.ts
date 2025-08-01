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
  serviceType: ["SMALL", "HOME", "OFFICE"],
  isProfileCompleted: true,
};

const signUpInfo = {
  email: "asdf@example.com",
  name: "그냥사람",
  phone: "01012345678",
  password: "asdf1234",
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
  serviceType: ["HOME", "OFFICE"],
  livingArea: ["서울", "경기"],
};

const clientMock = {
  fullClientInfo,
  signUpInfo,
  socialLoginInfo,
  fullClientSocialInfoBefore,
  fullClientSocialInfoAfter,
};

export default clientMock;
