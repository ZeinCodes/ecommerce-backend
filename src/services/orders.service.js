import ordersRepository from "../repositories/orders.repository.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";

const getOrders = async (userId) => {
    return await ordersRepository.getOrders(userId);
};

const getOrdersById = async (id, userId) => {
    const result = await ordersRepository.getOrdersById(
        id,
        userId
    );

    if (!result) {
        throw new NotFoundError("Order not found");
    }

    return result;
};

const getOrderItems = async (id, userId) => {
    const order = await ordersRepository.getOrdersById(
        id,
        userId
    );

    if (!order) {
        throw new NotFoundError("Order not found");
    }

    return await ordersRepository.getOrderItems(
        id,
        userId
    );
};

const createOrder = async (userId, items) => {
    try {
        return await ordersRepository.createOrder(
            userId,
            items
        );
    } catch (error) {
        if (
            error.message ===
            "One or more products not found"
        ) {
            throw new NotFoundError(error.message);
        }

        if (
            error.message.startsWith(
                "Insufficient stock for product"
            )
        ) {
            throw new BadRequestError(error.message);
        }

        throw error;
    }
};

const updateOrderStatus = async (id, status) => {
    const currentOrder =
        await ordersRepository.getOrderByIdForStatus(id);

    if (!currentOrder) {
        throw new NotFoundError("Order not found");
    }

    const allowedTransitions = {
        pending: [
            "processing",
            "cancelled"
        ],

        processing: [
            "shipped",
            "cancelled"
        ],

        shipped: [
            "delivered"
        ],

        delivered: [],

        cancelled: []
    };

    if (
        !allowedTransitions[currentOrder.status].includes(status)
    ) {
        throw new BadRequestError(
            `Cannot change order status from ${currentOrder.status} to ${status}`
        );
    }

    const result =
        await ordersRepository.updateOrderStatus(
            id,
            status
        );

    return result;
};

const ordersService = {
    getOrders,
    getOrdersById,
    getOrderItems,
    createOrder,
    updateOrderStatus
};

export default ordersService;