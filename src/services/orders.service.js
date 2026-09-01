import ordersRepository from "../repositories/orders.repository.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";

const getOrders = async (
    userId,
    userRole,
    page,
    limit
) => {
    return ordersRepository.getOrders(
        userId,
        userRole,
        page,
        limit
    );
};

const getOrdersById = async (
    id,
    userId,
    userRole
) => {
    const result =
        await ordersRepository.getOrdersById(
            id,
            userId,
            userRole
        );

    if (!result) {
        throw new NotFoundError(
            "Order not found"
        );
    }

    return result;
};

const getOrderItems = async (
    id,
    userId,
    userRole
) => {
    const order =
        await ordersRepository.getOrdersById(
            id,
            userId,
            userRole
        );

    if (!order) {
        throw new NotFoundError(
            "Order not found"
        );
    }

    return ordersRepository.getOrderItems(
        id,
        userId,
        userRole
    );
};

const createOrder = async (
    userId,
    items
) => {
    return ordersRepository.createOrder(
        userId,
        items
    );
};

const updateOrderStatus = async (
    id,
    status
) => {
    const currentOrder =
        await ordersRepository.getOrderByIdForStatus(
            id
        );

    if (!currentOrder) {
        throw new NotFoundError(
            "Order not found"
        );
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

    const validTransitions =
        allowedTransitions[
            currentOrder.status
        ];

    if (
        !validTransitions ||
        !validTransitions.includes(status)
    ) {
        throw new BadRequestError(
            `Cannot change order status from ${currentOrder.status} to ${status}`
        );
    }

    const updatedOrder =
        await ordersRepository.updateOrderStatus(
            id,
            status,
            currentOrder.status
        );

    if (!updatedOrder) {
        throw new BadRequestError(
            "Order status changed before the update could be completed"
        );
    }

    return updatedOrder;
};

const ordersService = {
    getOrders,
    getOrdersById,
    getOrderItems,
    createOrder,
    updateOrderStatus
};

export default ordersService;