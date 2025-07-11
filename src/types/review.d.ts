import { Review } from "@prisma/client";

export interface CreateReviewBody {
  estimateId: Review["estimateId"];
  rating: Review["rating"];
  content: Review["content"];
  clientId?: Review["clientId"];
  moverId: Review["moverId"];
}
