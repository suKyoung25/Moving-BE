// 일반 회원가입 자료 구조 : DB에 저장
export interface ISignUpDataLocal {
  email: string;
  name: string;
  phone: string;
  hashedPassword: string;
}

// 일반 회원가입 자료 구조 : FE에서 넘어옴
export interface ISignUpRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
}

// 일반 로그인 자료 구조 : DB
export interface ILoginDataLocal {
  email: string;
  hashedPassword: string;
}

// 일반 로그인 자료 구조 : FE
export interface ILoginRequest {
  email: string;
  password: string;
}

// 토큰 자료 구조
export interface IToken {
  id: string;
  email: string;
  userType: "client" | "mover";
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
