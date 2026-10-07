import { z } from "zod";

export const createAddressSchema = z.object({
    full_name: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100),

    phone: z
        .string()
        .trim()
        .min(5)
        .max(30)
        .optional(),

    street: z
        .string()
        .trim()
        .min(3, "Street must be at least 3 characters")
        .max(255),

    city: z
        .string()
        .trim()
        .min(2)
        .max(100),

    state: z
        .string()
        .trim()
        .max(100)
        .optional(),

    postal_code: z
        .string()
        .trim()
        .min(2)
        .max(20),

    country: z
        .string()
        .trim()
        .min(2)
        .max(100),

    is_default: z
        .boolean()
        .optional()
}).strict();

export const updateAddressSchema = z.object({
    full_name: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100)
        .optional(),

    phone: z
        .string()
        .trim()
        .min(5)
        .max(30)
        .optional(),

    street: z
        .string()
        .trim()
        .min(3, "Street must be at least 3 characters")
        .max(255)
        .optional(),

    city: z
        .string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

    state: z
        .string()
        .trim()
        .max(100)
        .optional(),

    postal_code: z
        .string()
        .trim()
        .min(2)
        .max(20)
        .optional(),

    country: z
        .string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

    is_default: z
        .literal(true)
        .optional()
}).strict().refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required"
    }
);