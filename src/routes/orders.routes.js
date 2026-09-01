import express from "express";
import ordersController from "../controllers/orders.controller.js";
import {
    createOrderSchema,
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
 *     summary: Create a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       422:
 *         description: Validation failed
 */
ordersRouter.post(
    "/orders",
    authenticate,
    validate(createOrderSchema),
    ordersController.createOrder
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
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