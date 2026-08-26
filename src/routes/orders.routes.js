import express from "express";
import ordersController from "../controllers/orders.controller.js";
import {
    createOrderSchema,
    updateOrderStatusSchema
} from "../validators/orders.validator.js";
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import validate from "../middlewares/validate.js";
import { paginationSchema } from "../validators/pagination.validation.js"

const ordersRouter = express.Router();

ordersRouter.get(
    "/orders",
    authenticate,
    validate(paginationSchema, "query"),
    ordersController.getOrders
);

ordersRouter.get(
    "/orders/:id",
    authenticate,
    ordersController.getOrders
);

ordersRouter.get(
    "/orders/:id/items",
    authenticate,
    ordersController.getOrderItems
);

ordersRouter.post(
    "/orders",
    authenticate,
    validate(createOrderSchema),
    ordersController.createOrder
);

ordersRouter.patch(
    "/orders/:id/status",
    authenticate,
    authorize("admin"),
    validate(updateOrderStatusSchema),
    ordersController.updateOrderStatus
);

export default ordersRouter;