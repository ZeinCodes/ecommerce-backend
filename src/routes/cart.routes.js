import express from "express";
import * as cartController from "../controllers/cart.controller.js";
import authenticate from "../middlewares/authentication.js";
import validate from "../middlewares/validate.js";
import {
    addCartItemSchema,
    updateCartItemSchema
} from "../validators/cart.validator.js";

const cartRouter = express.Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: Unauthorized
 */
cartRouter.get(
    "/cart",
    authenticate,
    cartController.getCart
);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add a product to the cart
 *     description: If the product is already in the cart, its quantity is incremented instead of creating a duplicate row.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *
 *     responses:
 *       201:
 *         description: Product added to cart
 *       400:
 *         description: Insufficient stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       422:
 *         description: Validation failed
 */
cartRouter.post(
    "/cart/items",
    authenticate,
    validate(addCartItemSchema),
    cartController.addItemToCart
);

/**
 * @swagger
 * /cart/items/{id}:
 *   patch:
 *     summary: Update a cart item's quantity
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
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Insufficient stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       422:
 *         description: Validation failed
 */
cartRouter.patch(
    "/cart/items/:id",
    authenticate,
    validate(updateCartItemSchema),
    cartController.updateItemQuantity
);

/**
 * @swagger
 * /cart/items/{id}:
 *   delete:
 *     summary: Remove an item from the cart
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
 *       204:
 *         description: Cart item removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
cartRouter.delete(
    "/cart/items/:id",
    authenticate,
    cartController.removeItem
);

export default cartRouter;