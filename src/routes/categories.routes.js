import express from "express";
import categoryController from "../controllers/categories.controllers.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import {
    createCategorySchema,
    updateCategorySchema
} from "../validators/categories.validator.js";
import { productsQuerySchema } from "../validators/pagination.validation.js";

const categoriesRouter = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Get all categories with pagination.
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
 *           default: 20
 *         description: Number of categories per page
 *
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
categoriesRouter.get(
    "/categories",
    validate(productsQuerySchema, "query"),
    categoryController.getAllCategories
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
categoriesRouter.get(
    "/categories/:id",
    categoryController.getCategoryById
);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Category already exists
 *       422:
 *         description: Validation failed
 */
categoriesRouter.post(
    "/categories",
    authenticate,
    authorize("admin"),
    validate(createCategorySchema),
    categoryController.postCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
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
 *                 example: Computers
 *
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category already exists
 *       422:
 *         description: Validation failed
 */
categoriesRouter.patch(
    "/categories/:id",
    authenticate,
    authorize("admin"),
    validate(updateCategorySchema),
    categoryController.patchCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     description: Soft delete a category.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *
 *     responses:
 *       204:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */
categoriesRouter.delete(
    "/categories/:id",
    authenticate,
    authorize("admin"),
    categoryController.deleteCategory
);

export default categoriesRouter;