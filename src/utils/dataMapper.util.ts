import { MoveType } from "@prisma/client";

//ERD의 enum serviceType과 프론트의 key값을 mapping 해주기 위함
export const serviceTypeMap: Record<string, MoveType> = {
  소형이사: "SMALL",
  가정이사: "HOME",
  사무실이사: "OFFICE",
};
