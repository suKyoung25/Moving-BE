//기사님 기본정보 수정 시 필요한 타입 (컨트롤러, 서비스 단)
export type EditMoverAccount = {
  moverId: string;
  name: string;
  email: string;
  phone: string;
  existedPassword?: string;
  newPassword?: string;
};

//기사님 기본정보 수정 시 필요한 타입 (레포지토리 단)
export type EditMoverAccountWithHash = {
  moverId: string;
  name: string;
  email: string;
  phone: string;
  hashedNewPassword?: string;
};
