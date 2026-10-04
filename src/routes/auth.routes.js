import express from "express";
import validate from "../middlewares/validate.js";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import {
    loginSchema,
    registerSchema,
    refreshSchema,
    logoutSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../validators/users.validator.js";

const authRouter = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many login attempts, please try again later"
    }
})

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many password reset requests, please try again later"
    }
})

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many password reset attempts. Please try again later."
    }
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many sign up attempts, please try again later"
    }
})

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registry
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *
 *     responses:
 *       201:
 *         description: Signed Up successfully
 *
 *       400:
 *         description: Bad request
 *
 *       409:
 *         description: Conflict
 *
 *       422:
 *         description: Unprocessable Entity
 */

authRouter.post(
    '/auth/register',
    registerLimiter,
    validate(registerSchema),
    authController.userRegister
)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     description: Authenticate a user and return access and refresh tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Welcome Back John
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *
 *       401:
 *         description: Invalid email or password
 *
 *       422:
 *         description: Validation failed
 */
authRouter.post(
    "/auth/login",
    loginLimiter,
    validate(loginSchema),
    authController.userLogin
)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     description: Generate a new access token using a valid refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token received during login
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *       401:
 *         description: Invalid or expired refresh token
 *       422:
 *         description: Validation failed
 */
authRouter.post(
    "/auth/refresh",
    validate(refreshSchema),
    authController.refresh
)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     description: Delete the refresh token and log the user out.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token received during login
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully logged out
 *       401:
 *         description: Invalid refresh token
 *       422:
 *         description: Validation failed
 */
authRouter.post(
    "/auth/logout",
    validate(logoutSchema),
    authController.logout
)
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     tags: [Authentication]
 *     description: Send a password reset link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: If the email exists, a reset link has been sent
 *       422:
 *         description: Validation failed
 *       429:
 *         description: Too many requests
 */

authRouter.post(
    "/auth/forgot-password",
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    authController.forgotPassword
)

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags:
 *       - Authentication
 *     description: Reset the password using a valid reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token received by email.
 *                 example: abc123def456
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired password reset token
 *       422:
 *         description: Validation failed
 *       429:
 *         description: Too many requests
 */
authRouter.post(
    "/auth/reset-password",
    resetPasswordLimiter,
    validate(resetPasswordSchema),
    authController.resetPassword
)

export default authRouter;