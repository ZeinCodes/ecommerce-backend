import express from "express";
import ordersController from "../controllers/orders.controller.js";
import {
    updateOrderStatusSchema
} from "../validators/orders.validator.js";
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import validate from "../middlewares/validate.js";
import {
    paginationSchema
} from "../validators/pagination.validation.js";

const ordersRouter = express.Router();

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get orders
 *     tags: [Orders]
 *     description: Get orders with pagination.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 */
ordersRouter.get(
    "/orders",
    authenticate,
    validate(
        paginationSchema,
        "query"
    ),
    ordersController.getOrders
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
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
 *         description: Order retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
ordersRouter.get(
    "/orders/:id",
    authenticate,
    ordersController.getOrders
);

/**
 * @swagger
 * /orders/{id}/items:
 *   get:
 *     summary: Get order items
 *     tags: [Orders]
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
 *         description: Order items retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
ordersRouter.get(
    "/orders/:id/items",
    authenticate,
    ordersController.getOrderItems
);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order from the current user's cart
 *     tags: [Orders]
 *     description: Converts the authenticated user's cart into an order. Cart must not be empty; stock is re-validated at checkout and the cart is cleared on success.
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Cart is empty, or insufficient stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
ordersRouter.post(
    "/orders",
    authenticate,
    ordersController.createOrder
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - processing
 *                   - shipped
 *                   - delivered
 *                   - cancelled
 *
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       422:
 *         description: Validation failed
 */
ordersRouter.patch(
    "/orders/:id/status",
    authenticate,
    authorize("admin"),
    validate(updateOrderStatusSchema),
    ordersController.updateOrderStatus
);

export default ordersRouter;