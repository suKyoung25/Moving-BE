import z from "zod";
import {
  CreateReviewSchema,
  ReviewIdParamsSchema,
  UpdateReviewschema,
} from "../schemas/review.schema";

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;

export type UpdateReviewDto = z.infer<typeof UpdateReviewschema>;

export type ReviewIdParamsDto = z.infer<typeof ReviewIdParamsSchema>;
