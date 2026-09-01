import express from "express";
import {
    createUserSchema,
    updateUserSchema
} from "../validators/users.validator.js";
import validate from "../middlewares/validate.js";
import * as userController from "../controllers/users.controller.js";
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import authorizeOwner from "../middlewares/ownership.js";
import { productsQuerySchema } from "../validators/pagination.validation.js";

const usersRouter = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Get all users with pagination.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
usersRouter.get(
    "/users",
    authenticate,
    authorize("admin"),
    validate(productsQuerySchema, "query"),
    userController.getAllUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
usersRouter.get(
    "/users/:id",
    authenticate,
    authorize("admin"),
    userController.getUserById
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
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
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *
 *               role:
 *                 type: string
 *                 enum:
 *                   - user
 *                   - admin
 *                 example: user
 *
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: User already exists
 *       422:
 *         description: Validation failed
 */
usersRouter.post(
    "/users",
    authenticate,
    authorize("admin"),
    validate(createUserSchema),
    userController.postUser
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Smith
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.smith@example.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123
 *
 *               role:
 *                 type: string
 *                 enum:
 *                   - user
 *                   - admin
 *                 example: user
 *
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       409:
 *         description: Conflict
 *       422:
 *         description: Validation failed
 */
usersRouter.patch(
    "/users/:id",
    authenticate,
    authorizeOwner(),
    validate(updateUserSchema),
    userController.patchUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Soft delete a user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
usersRouter.delete(
    "/users/:id",
    authenticate,
    authorizeOwner(),
    userController.deleteUser
);

export default usersRouter;