import express from "express";
import validate from "../middlewares/validate.js";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import { 
    loginSchema,
    registerSchema,
    logoutSchema
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
 *       200:
 *         description: Signed Up successfully
 * 
 *       400:
 *         description: Bad request
 *         
 *       409: 
 *         description: Conflict
 *         
 *       422:
 *         description: Unprocessable Entity *         
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
 *     description: Authenticate a user and return a JWT token.
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
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
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
 */
authRouter.post(
    "/auth/refresh",
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

export default authRouter;