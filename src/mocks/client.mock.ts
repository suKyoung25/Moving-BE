/**
 * auth
 */

import { MoveType, Provider } from "@prisma/client";
import { ClientProfileRegister } from "../types";

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

/**
 * 프로필
 */

const deficientDataInDB = {
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
};

const fullDataInDB = {
  id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
  email: "asdf@example.com",
  name: "그냥사람",
  phone: "01012345678",
  hashedPassword: "asdf1234에이것저것덧붙임",
  profileImage: "이미지주소",
  provider: "LOCAL",
  isProfileCompleted: true,
  serviceType: ["SMALL", "HOME", "OFFICE"],
  livingArea: [{ regionName: "서울" }, { regionName: "경기" }],
};

const profileInfo: ClientProfileRegister = {
  profileImage: "이미지주소",
  serviceType: [MoveType.SMALL, MoveType.HOME, MoveType.OFFICE],
  livingArea: ["서울", "경기"],
};

const profileImageEdit = {
  profileImage: "이미지주소를바꿈",
};

const fullDataInDBChanged = {
  id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
  email: "asdf@example.com",
  name: "그냥사람",
  phone: "01012345678",
  hashedPassword: "asdf1234에이것저것덧붙임",
  profileImage: "이미지주소를바꿈",
  provider: "LOCAL",
  isProfileCompleted: true,
  serviceType: ["SMALL", "HOME", "OFFICE"],
  livingArea: ["서울", "경기"],
};

const deficientDataToFE = {
  accessToken: "이것은-accessToken-이다",
  refreshToken: "이것은-refreshToken-이다",
  user: {
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
    userType: "client",
  },
};

const fullDataToFE = {
  accessToken: "이것은-accessToken-이다",
  refreshToken: "이것은-refreshToken-이다",
  user: {
    id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
    email: "asdf@example.com",
    name: "그냥사람",
    phone: "01012345678",
    hashedPassword: "asdf1234에이것저것덧붙임",
    profileImage: "이미지주소",
    provider: "LOCAL",
    isProfileCompleted: false,
    serviceType: ["SMALL", "HOME", "OFFICE"],
    livingArea: ["서울", "경기"],
    userType: "client",
  },
};

const filteredDeficientDataInDB = {
  id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
  email: "asdf@example.com",
  name: "그냥사람",
  phone: "01012345678",
  profileImage: "",
  provider: "LOCAL",
  isProfileCompleted: false,
  serviceType: [],
  livingArea: [],
};

const filteredFullDataInDB = {
  id: "fc6796df-4ed0-46db-a1d7-7c28ce49979d",
  email: "asdf@example.com",
  name: "그냥사람",
  phone: "01012345678",
  profileImage: "이미지주소",
  provider: "LOCAL",
  isProfileCompleted: true,
  serviceType: ["SMALL", "HOME", "OFFICE"],
  livingArea: ["서울", "경기"],
};

export const profileMock = {
  deficientDataInDB,
  fullDataInDB,
  profileInfo,
  deficientDataToFE,
  fullDataToFE,
  filteredDeficientDataInDB,
  filteredFullDataInDB,
  profileImageEdit,
  fullDataInDBChanged,
};
