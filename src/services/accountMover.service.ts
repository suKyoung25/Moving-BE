import { ErrorMessage } from "../constants/ErrorMessage";
import accountMoverRepository from "../repositories/accountMover.repository";
import authMoverRepository from "../repositories/authMover.repository";
import { EditMoverAccount } from "../types/account.types";
import { ConflictError } from "../types/errors";
import { hashPassword } from "../utils/auth.util";

//기사님 기본 정보 수정
async function patchMoverAccount(newData: EditMoverAccount) {
  //기본의 DB와 겹치는 데이터 있는지 확인 (authRepository쪽 로직 사용)
  const existedEmail = await authMoverRepository.findMoverByEmail(newData.email);
  const existedPhone = await authMoverRepository.findMoverByPhone(newData.phone);

  const fieldErrors: Record<string, string> = {};

  if (existedEmail) {
    fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
  }
  if (existedPhone) {
    fieldErrors.phone = ErrorMessage.ALREADY_EXIST_PHONE;
  }

  //겹치는 데이터 있으면 프론트로 에러 보내기
  if (Object.keys(fieldErrors).length > 0) {
    throw new ConflictError("중복 정보로 인한 회원가입 실패: ", fieldErrors);
  }

  //프론트에서 받은 비밀번호 해시
  const hashedNewPassword = await hashPassword(newData.newPassword);

  const patchedMoverAccount = await accountMoverRepository.patchMoverAccount({
    ...newData,
    hashedNewPassword,
  });

  return {
    updatedMoverAccount: {
      moverId: patchedMoverAccount.id,
      name: patchedMoverAccount.name,
      email: patchedMoverAccount.email,
      phone: patchedMoverAccount.phone,
    },
  };
}

export default {
  patchMoverAccount,
};
