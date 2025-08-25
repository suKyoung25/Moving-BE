import { MoveType } from "@prisma/client";

// 프로필 등록
export interface ClientProfileRegister {
  profileImage?: string;
  serviceType: MoveType[];
  livingArea: string[];
}

// 프로필 수정
export interface ClientProfileUpdate {
  email?: string;
  name?: string;
  phone?: string;
  password?: string;
  profileImage?: string;
  serviceType?: MoveType[];
  livingArea?: string[];
  newPassword?: string;
  newPasswordConfirmation?: string;
}
