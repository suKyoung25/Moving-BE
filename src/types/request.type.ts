import { MoveType } from "@prisma/client";

export interface GetReceivedRequestsQuery {
  moveType?: string;
  serviceArea?: string;
  isDesignated?: string;
  keyword?: string;
  sort?: "moveDate-asc" | "moveDate-desc";
  limit?: string;
  cursor?: string;
  moverId: string;
}

export interface GetFilteredRequestsInput {
  moveType?: MoveType[];
  serviceAreaList?: string[];
  isDesignated?: boolean;
  keyword?: string;
  sort?: "moveDate-asc" | "moveDate-desc";
  limit?: number;
  cursor?: string;
  moverId: string;
}

export interface GetClientRequestsInput {
  clientId: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}
