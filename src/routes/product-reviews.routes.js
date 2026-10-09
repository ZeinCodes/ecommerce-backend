import express from "express";
import reviewsController from "../controllers/product-reviews.controller.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authentication.js";
import {
    createReviewSchema,
    updateReviewSchema
} from "../validators/product-reviews.validator.js";
import {
    paginationSchema
} from "../validators/pagination.validation.js";

const productReviewsRouter = express.Router();

/**
 * @swagger
 * /products/{productId}/reviews:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Product Reviews]
 *     description: Get a product's reviews with pagination.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       404:
 *         description: Product not found
 *       422:
 *         description: Validation failed
 */
productReviewsRouter.get(
    "/products/:productId/reviews",
    validate(
        paginationSchema,
        "query"
    ),
    reviewsController.getAllReviews
);

/**
 * @swagger
 * /products/{productId}/reviews/{reviewId}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Product Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *       404:
 *         description: Review not found
 */
productReviewsRouter.get(
    "/products/:productId/reviews/:reviewId",
    reviewsController.getReviewById
);

/**
 * @swagger
 * /products/{productId}/reviews:
 *   post:
 *     summary: Add a review to a product
 *     tags: [Product Reviews]
 *     description: A user can have only one active review per product.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               user_comment:
 *                 type: string
 *                 maxLength: 1000
 *
 *     responses:
 *       201:
 *         description: Review created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: User has already reviewed this product
 *       422:
 *         description: Validation failed
 */
productReviewsRouter.post(
    "/products/:productId/reviews",
    authenticate,
    validate(createReviewSchema),
    reviewsController.postReview
);

/**
 * @swagger
 * /products/{productId}/reviews/{reviewId}:
 *   patch:
 *     summary: Update your review
 *     tags: [Product Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: reviewId
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               user_comment:
 *                 type: string
 *                 maxLength: 1000
 *
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found or not owned by the user
 *       422:
 *         description: Validation failed
 */
productReviewsRouter.patch(
    "/products/:productId/reviews/:reviewId",
    authenticate,
    validate(updateReviewSchema),
    reviewsController.patchReview
);

/**
 * @swagger
 * /products/{productId}/reviews/{reviewId}:
 *   delete:
 *     summary: Delete your review
 *     tags: [Product Reviews]
 *     description: Soft delete a review.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found or not owned by the user
 */
productReviewsRouter.delete(
    "/products/:productId/reviews/:reviewId",
    authenticate,
    reviewsController.deleteReview
);

export default productReviewsRouter;