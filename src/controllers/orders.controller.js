import ordersService from "../services/orders.service.js";

const getOrders = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (id) {
            const order = await ordersService.getOrdersById(
                id,
                userId,
                userRole
            );

            return res.status(200).json({
                message: "Order",
                success: true,
                order
            });
        }

        const { page, limit } = req.validated.query;

        const result = await ordersService.getOrders(
            userId,
            userRole,
            page,
            limit
        );

        const totalPages = Math.ceil(result.total / limit);

        return res.status(200).json({
            success: true,
            result: result.orders,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

const getOrderItems = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const items = await ordersService.getOrderItems(
            id,
            userId,
            userRole
        );

        return res.status(200).json({
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
        const { items } = req.validated.body;

        const order = await ordersService.createOrder(
            userId,
            items
        );

        return res.status(201).json({
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
        const { status } = req.validated.body;

        const order = await ordersService.updateOrderStatus(
            id,
            status
        );

        return res.status(200).json({
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