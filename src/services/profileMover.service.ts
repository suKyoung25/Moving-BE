/**
 * @file profile.service.ts
 * @description
 * - 프로필 관련 로직을 처리하는 서비스 계층 모듈
 * - repository에서 데이터를 조회하고, 암호화/토큰 관련 유틸 함수 사용
 *
 */

import { moverSignin } from "../controllers/authMover.controller";
import profileRespository from "../repositories/profileMover.respository";
import { CreateMoverProfile } from "../types";
import { serviceTypeMap } from "../utils/dataMapper.util";

//기사님 프로필 생성/수정
async function createMoverProfile(user: CreateMoverProfile) {
  //serviceType 데이터 맞추기
  const mappedServiceType = user.serviceType.map((label) => serviceTypeMap[label]);
  return await profileRespository.saveMoverProfile({ ...user, serviceType: mappedServiceType });
}

export default {
  createMoverProfile,
};
