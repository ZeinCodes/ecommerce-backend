
import express from "express";

import * as wishlistController from "../controllers/wishlist.controller.js";
import authenticate from "../middlewares/authentication.js";

const wishlistRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist management
 */

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get the current user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *       401:
 *         description: Unauthorized
 */
wishlistRouter.get(
    "/wishlist",
    authenticate,
    wishlistController.getWishlistItems
);

/**
 * @swagger
 * /wishlist/{productId}:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: UUID of the product
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Product added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product already exists in the wishlist
 */
wishlistRouter.post(
    "/wishlist/:productId",
    authenticate,
    wishlistController.addWishlistItem
);

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: UUID of the product
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wishlist item not found
 */
wishlistRouter.delete(
    "/wishlist/:productId",
    authenticate,
    wishlistController.removeWishlistItem
);

export default wishlistRouter;