import express from "express";
import validate from "../middlewares/validate.js";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import { 
    loginSchema,
    registerSchema
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
);

export default authRouter;