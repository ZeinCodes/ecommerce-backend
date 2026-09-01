import { z } from "zod";

export const createProductSchema = z.object({
    category_id: z.uuid(),

    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    description: z
        .string()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional(),

    price: z
        .number()
        .nonnegative("Price cannot be negative"),

    stock: z
        .number()
        .int("Stock must be an integer")
        .nonnegative("Stock cannot be negative"),

    sku: z
        .string()
        .min(2, "SKU must be at least 2 characters")
        .max(50, "SKU cannot exceed 50 characters")
}).strict();

export const updateProductSchema = createProductSchema
    .partial()
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required"
        }
    )