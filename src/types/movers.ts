//기사님 생성할 때 필요한 값 (컨트롤러, 서비스 단)
export type createMoverInput = {
  nickName: string;
  email: string;
  phone: string;
  password: string;
};

//기사님 생성할 때 필요한 값 (레포지토리 단)
export type createMoverInputwithHash = {
  nickName: string;
  email: string;
  phone: string;
  password: string;
  hashedPassword: string;
};
