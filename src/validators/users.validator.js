import { email, z } from "zod";

export const createUserSchema = z.object({
    name: z
    .string()
    .min(3, "Name must be at least 3 charchters")
    .max(50, "Name cannot exceed 50 charchters"),

    email: z
    .email("Invalid email address"),

    password: z
    .string()
    .min(8, "Password must be at least 8 charchters"),

    role: z
    .enum(["admin", "user"])
}).strict();

export const loginSchema = z.object({
    email: z
    .email("Invalid email address"),

    password: z
    .string()
    .min(8, "Password must be at least 8 charchters")
})

export const updateUserSchema = 
    createUserSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required"
        }
    ).strict();