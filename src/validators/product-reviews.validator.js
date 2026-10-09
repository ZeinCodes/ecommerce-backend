import { z } from "zod";

export const createReviewSchema = z.object({
    rating: z
        .number()
        .int("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),

    user_comment: z
        .string()
        .max(1000, "Comment cannot exceed 1000 characters")
        .optional()
}).strict();

export const updateReviewSchema = createReviewSchema
    .partial()
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required"
        }
    );