import { z } from "zod";

export const createOrderSchema = z.object({
    address_id: z.uuid().optional()
}).strict().optional();

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ])
});