import { z } from "zod";

export const paginationSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .default(20)
}).strict();

export const productsQuerySchema = paginationSchema.extend({
    category_id: z.uuid().optional(),

    min_price: z.coerce
        .number()
        .nonnegative()
        .optional(),

    max_price: z.coerce
        .number()
        .nonnegative()
        .optional(),

    name: z
        .string()
        .trim()
        .min(1)
        .optional(),

    sortBy: z.enum([
        "created_at",
        "name",
        "price",
        "stock"
    ])
        .default("created_at"),

    order: z.enum([
        "asc",
        "desc"
    ])
        .default("desc")
}).strict().refine(
    (data) =>
        data.min_price === undefined ||
        data.max_price === undefined ||
        data.min_price <= data.max_price,
    {
        message: "min_price cannot exceed max_price",
        path: ["max_price"]
    }
);

export const categoriesQuerySchema = paginationSchema.extend({
    name: z
        .string()
        .trim()
        .min(1)
        .optional()
}).strict();