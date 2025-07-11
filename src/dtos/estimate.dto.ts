export type CreateRequestDto = {
  moveType: "SMALL" | "HOME" | "OFFICE";
  moveDate: Date;
  fromAddress: string;
  toAddress: string;
};
