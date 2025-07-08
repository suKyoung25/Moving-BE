export const ErrorMessage = {
  // Not Found
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  ACCESSTOKEN_NOT_FOUND: "accessToken을 찾을 수 없습니다.",
  REFRESHTOKEN_NOT_FOUND: "refreshToken을 찾을 수 없습니다.",
  JWT_SECRET_NOT_FOUND: "jwt 시크릿키를 찾을 수 없습니다.",
  JWT_EXPIRES_IN_NOT_FOUND: "jwt 유효기간을 찾을 수 없습니다.",

  // Not Match
  PASSWORD_NOT_MATCH: "비밀번호가 일치하지 않습니다.",
  PASSWORD_CONFIRMATION_NOT_MATCH: "비밀번호 확인이 일치하지 않습니다.",

  // Already Exist
  ALREADY_EXIST_EMAIL: "이미 사용중인 이메일입니다.",
  ALREADY_EXIST_NICKNAME: "이미 사용중인 닉네임입니다.",
  ALREADY_EXIST_PHONE: "이미 사용중인 번호입니다.",

  // Invalid
  INVALID_EMAIL: "잘못된 이메일입니다.",
  INVALID_INPUT: "필수 정보를 모두 입력해주세요.",
  INVALID_ACCESS_TOKEN: "유효하지 않은 accessToken 입니다.",
  INVALID_REFRESH_TOKEN: "유효하지 않은 refresh Token 입니다.",

  UNAUTHORIZED: "인증되지 않은 사용자입니다.",
  FORBIDDEN: "요청한 작업을 수행하기 위한 권한이 없습니다.",
};
