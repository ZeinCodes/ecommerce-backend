import { z } from "zod";

export const addCartItemSchema = z.object({
    product_id: z.uuid(),

    quantity: z
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be greater than 0")
}).strict();

export const updateCartItemSchema = z.object({
    quantity: z
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be greater than 0")
}).strict();