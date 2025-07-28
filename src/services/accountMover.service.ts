import accountMoverRepository from "../repositories/accountMover.repository";
import { EditMoverAccount } from "../types/account.types";
import { hashPassword } from "../utils/auth.util";

//기사님 기본 정보 수정
async function patchMoverAccount(newData: EditMoverAccount) {
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
