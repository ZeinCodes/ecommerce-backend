import z from "zod";

export const productsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    category_id: z.uuid().optional(),
    min_price: z.coerce.number().nonnegative().default(0).optional(),
    max_price: z.coerce.number().nonnegative().optional()
})