import z from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(20, "Name cannot exceed 20 characters")
});

export const updateCategorySchema = createCategorySchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required"
        }
    )
    .strict();