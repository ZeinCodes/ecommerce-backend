import express from "express";
import productsController from "../controllers/products.controller.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import {
    createProductSchema,
    updateProductSchema
} from "../validators/products.validator.js";
import { productsQuerySchema } from "../validators/pagination.validation.js";

const productsRouter = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Get products with pagination, filtering, searching and sorting.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of products per page
 *
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter products by category
 *
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum product price
 *
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum product price
 *
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search products by name
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, created_at]
 *         description: Field used for sorting
 *
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *
 *       400:
 *         description: Invalid query parameters
 *
 *       422:
 *         description: Validation failed
 */
productsRouter.get(
    "/products",
    validate(productsQuerySchema, "query"),
    productsController.getAllProducts
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
productsRouter.get(
    "/products/:id",
    productsController.getProductById
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - name
 *               - price
 *               - stock
 *               - sku
 *             properties:
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: double
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Conflict
 */
productsRouter.post(
    "/products",
    authenticate,
    authorize("admin"),
    validate(createProductSchema),
    productsController.postProduct
);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: double
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       409:
 *         description: Conflict
 */
productsRouter.patch(
    "/products/:id",
    authenticate,
    authorize("admin"),
    validate(updateProductSchema),
    productsController.patchProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */
productsRouter.delete(
    "/products/:id",
    authenticate,
    authorize("admin"),
    productsController.deleteProduct
);

export default productsRouter;