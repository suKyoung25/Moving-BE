//기사님 회원가입할 때 필요한 값 (컨트롤러, 서비스 단)
export type createMoverInput = {
    name: string;
    email: string;
    phone: string;
    password: string;
};

//기사님 회원가입할 때 필요한 값 (레포지토리 단)
export type createMoverInputwithHash = {
    name: string;
    email: string;
    phone: string;
    password: string;
    hashedPassword: string;
};

//기사님 로그인할 때 필요한 값 (컨트롤러, 서비스 단)
export type getMoverInput = {
    email: string;
    password: string;
};
