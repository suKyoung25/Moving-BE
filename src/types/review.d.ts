import { Client, Review } from "@prisma/client";

export interface CreateReviewBody {
  estimateId: Review["estimateId"];
  rating: Review["rating"];
  content: Review["content"];
  clientId?: Review["clientId"];
  moverId: Review["moverId"];
}

export interface UpdateReviewBody {
  rating?: Review["rating"];
  content?: Review["content"];
}

export interface ReviewIdParams {
  reviewId: Review["id"];
}
