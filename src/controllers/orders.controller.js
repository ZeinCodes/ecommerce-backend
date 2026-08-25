import ordersService from "../services/orders.service.js";

const getOrders = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const orders = id
            ? await ordersService.getOrdersById(
                id,
                userId
            )
            : await ordersService.getOrders(
                userId
            );

        res.status(200).json({
            message: "Orders",
            success: true,
            orders
        });
    } catch (error) {
        next(error);
    }
};

const getOrderItems = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const items =
            await ordersService.getOrderItems(
                id,
                userId
            );

        res.status(200).json({
            message: "Items",
            success: true,
            items
        });
    } catch (error) {
        next(error);
    }
};

const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { items } = req.body;

        const order =
            await ordersService.createOrder(
                userId,
                items
            );

        res.status(201).json({
            message: "Order created",
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order =
            await ordersService.updateOrderStatus(
                id,
                status
            );

        res.status(200).json({
            message: "Order updated",
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

const ordersController = {
    getOrders,
    getOrderItems,
    createOrder,
    updateOrderStatus
};

export default ordersController;