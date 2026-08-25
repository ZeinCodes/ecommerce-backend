import { z } from "zod";

export const createOrderSchema = z.object({
    items: z
        .array(
            z.object({
                product_id: z.uuid(),
                quantity: z.number().int().positive()
            })
        )
        .min(1)
        .superRefine((items, ctx) => {
            const productIds = items.map(item => item.product_id);
            const uniqueProductIds = new Set(productIds);

            if (uniqueProductIds.size !== productIds.length) {
                ctx.addIssue({
                    code: "custom",
                    message: "Duplicate products are not allowed"
                });
            }
        })
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ])
});