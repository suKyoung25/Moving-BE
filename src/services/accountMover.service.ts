import { ErrorMessage } from "../constants/ErrorMessage";
import accountMoverRepository from "../repositories/accountMover.repository";
import authMoverRepository from "../repositories/authMover.repository";
import { EditMoverAccount } from "../types/account.types";
import { ConflictError } from "../types/errors";
import { hashPassword } from "../utils/auth.util";
import bcrypt from "bcrypt";

//기사님 기본 정보 수정
async function patchMoverAccount(newData: EditMoverAccount) {
  //DB에 존재하는 본인 확인 (authRepository쪽 로직 사용)
  const existedMoverData = await authMoverRepository.getMoverByEmail(newData.email);

  // "현재 비밀번호"가 DB에 있는 비밀번호와 일치하는지 검사 (본인 확인)
  const isPasswordCorrect = await bcrypt.compare(
    newData.existedPassword,
    existedMoverData?.hashedPassword!,
  );

  //내 이메일을 제외하고 존재하는 이메일인지 확인
  const isExistedEmail = await accountMoverRepository.findMoverByEmailExcludingSelf(
    newData.email,
    newData.moverId,
  );

  //내 폰번호를 제외하고 존재하는 폰번호인지 확인
  const isExistedPhone = await accountMoverRepository.findMoverByPhoneExcludingSelf(
    newData.phone,
    newData.moverId,
  );

  const fieldErrors: Record<string, string> = {};

  if (isExistedEmail) {
    fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
  }
  if (!isPasswordCorrect) {
    fieldErrors.existedPassword = ErrorMessage.PASSWORD_NOT_MATCH;
  }
  if (isExistedPhone) {
    fieldErrors.phone = ErrorMessage.ALREADY_EXIST_PHONE;
  }

  //안 맞는 데이터 있으면 프론트로 에러 보내기
  if (Object.keys(fieldErrors).length > 0) {
    throw new ConflictError("DB와 대조 시 유효하지 않아서 실패: ", fieldErrors);
  }

  //프론트에서 받은 비밀번호 해시
  let hashedNewPassword: string | undefined = undefined;

  if (newData.newPassword) {
    hashedNewPassword = await hashPassword(newData.newPassword);
  }

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
