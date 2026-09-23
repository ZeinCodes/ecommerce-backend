import express from "express";
import productsController from "../controllers/products.controller.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import {
    createProductSchema,
    updateProductSchema
} from "../validators/products.validator.js";
import {
    productsQuerySchema
} from "../validators/pagination.validation.js";
import upload from "../middlewares/upload.js";

const productsRouter = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     description: Get products with pagination, filtering, searching and sorting.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *           minimum: 0
 *
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *           minimum: 0
 *
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - created_at
 *             - name
 *             - price
 *             - stock
 *
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           default: desc
 *
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       422:
 *         description: Validation failed
 */
productsRouter.get(
    "/products",
    validate(
        productsQuerySchema,
        "query"
    ),
    productsController.getAllProducts
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
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
 *     tags: [Products]
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
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Conflict
 *       422:
 *         description: Validation failed
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
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
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
 *       422:
 *         description: Validation failed
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
 *     tags: [Products]
 *     description: Soft delete a product.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
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

/**
 * @swagger
 * /products/{productId}/images:
 *   get:
 *     summary: Get all images for a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product images retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */
productsRouter.get(
    "/products/:productId/images",
    productsController.getProductImages
);

/**
 * @swagger
 * /products/{productId}/images:
 *   post:
 *     summary: Add images to a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images added successfully
 *       400:
 *         description: Invalid image files
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */
productsRouter.post(
    "/products/:productId/images",
    authenticate,
    authorize("admin"),
    upload.array("images", 3),
    productsController.addImagetoProduct
);

/**
 * @swagger
 * /products/{productId}/images/{imageId}:
 *   delete:
 *     summary: Delete an image from a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product or image not found
 */
productsRouter.delete(
    "/products/:productId/images/:imageId",
    authenticate,
    authorize("admin"),
    productsController.deleteProductImage
);

export default productsRouter;