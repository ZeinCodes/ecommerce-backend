import { z } from "zod";

export const createUserSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password cannot exceed 72 characters"),

    role: z
        .enum(["admin", "user"])
}).strict();

export const registerSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password cannot exceed 72 characters"),
}).strict();

export const loginSchema = z.object({
    email: z
        .email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required")
        .max(72, "Password cannot exceed 72 characters")
}).strict();

export const refreshSchema = z.object({
    refreshToken: z
        .string()
        .min(1, "refreshToken is required")
}).strict();

export const logoutSchema = z.object({
    refreshToken: z
        .string()
        .min(1, "refreshToken is required")
}).strict();

export const forgotPasswordSchema = z.object({
    email: z
        .email("Invalid email address")
}).strict();

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),

    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password cannot exceed 72 characters")
}).strict();

export const updateUserSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password cannot exceed 72 characters")
})
    .partial()
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required"
        }
    )