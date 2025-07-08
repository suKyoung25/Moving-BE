/**
 * @file profile.service.ts
 * @description
 * - 프로필 관련 로직을 처리하는 서비스 계층 모듈
 * - repository에서 데이터를 조회하고, 암호화/토큰 관련 유틸 함수 사용
 *
 */

import { createMoverProfile } from "../types/mover.type";
import profileRespository from "../repositories/profile.respository";

//기사님 프로필 생성
async function createMoverProfile(user: createMoverProfile) {
  return await profileRespository.saveMoverProfile(user);
}
export default {
  createMoverProfile,
};
