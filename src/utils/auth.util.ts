import bcrypt from "bcrypt";

// 비밀번호 해싱 함수
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
