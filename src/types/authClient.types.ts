// 일반 회원가입 자료 구조 : DB에 저장
export interface ISignUpDataLocal {
  email: string;
  name: string;
  phone: string;
  hashedPassword: string;
}

// 일반 로그인 자료 구조 : DB
export interface ILoginDataLocal {
  email: string;
  hashedPassword: string;
}

//
export interface ISignUpFormSocial {
  email: string;
  name: string;
  phone: string;
  provider: "KAKAO" | "GOOGLE";
  providerId: string;
}

export type ISignUpForm = ISignUpDataLocal | ISignUpFormSocial;
