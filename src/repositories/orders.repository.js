import pool from "../db/database.js";
import {
    SHIPPING_COST_CENTS,
    TAX_RATE
} from "../config/orderPricing.js";
import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";

const getOrders = async (
    userId,
    userRole,
    page,
    limit
) => {
    const offset = (page - 1) * limit;

    const conditions = [
        "deleted_at IS NULL"
    ];

    const params = [];

    if (userRole !== "admin") {
        params.push(userId);

        conditions.push(
            `user_id = $${params.length}`
        );
    }

    const whereClause = conditions.join(" AND ");

    const limitPlaceholder = params.length + 1;
    const offsetPlaceholder = params.length + 2;

    const ordersParams = [
        ...params,
        limit,
        offset
    ];

    const ordersResult = await pool.query(
        `SELECT *
         FROM orders
         WHERE ${whereClause}
         ORDER BY created_at DESC, id DESC
         LIMIT $${limitPlaceholder}
         OFFSET $${offsetPlaceholder}`,
        ordersParams
    );

    const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM orders
         WHERE ${whereClause}`,
        params
    );

    return {
        orders: ordersResult.rows,
        total: Number(countResult.rows[0].count)
    };
};

const getOrdersById = async (
    id,
    userId,
    userRole
) => {
    let query = `
        SELECT *
        FROM orders
        WHERE id = $1
        AND deleted_at IS NULL
    `;

    const params = [id];

    if (userRole !== "admin") {
        query += ` AND user_id = $2`;
        params.push(userId);
    }

    const result = await pool.query(
        query,
        params
    );

    return result.rows[0];
};

const getOrderItems = async (
    id,
    userId,
    userRole
) => {
    let query = `
        SELECT
            oi.product_id,
            p.name,
            oi.quantity,
            oi.price,
            (oi.price * oi.quantity) AS total_price
        FROM order_items oi
        JOIN products p
            ON p.id = oi.product_id
        JOIN orders o
            ON o.id = oi.order_id
        WHERE oi.order_id = $1
        AND o.deleted_at IS NULL
    `;

    const params = [id];

    if (userRole !== "admin") {
        query += ` AND o.user_id = $2`;
        params.push(userId);
    }

    query += ` ORDER BY oi.created_at`;

    const result = await pool.query(
        query,
        params
    );

    return result.rows;
};

const createOrder = async (
    userId,
    addressId
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const cartResult = await client.query(
            `SELECT
                ci.product_id,
                ci.quantity
             FROM cart_items ci
             JOIN products p
                ON p.id = ci.product_id
                AND p.deleted_at IS NULL
             WHERE ci.user_id = $1
             AND ci.deleted_at IS NULL
             ORDER BY ci.product_id
             FOR UPDATE OF ci`,
            [userId]
        );

        const cartItems = cartResult.rows;

        if (cartItems.length === 0) {
            throw new BadRequestError("Cart is empty");
        }

        const addressResult = addressId
            ? await client.query(
                `SELECT *
                 FROM addresses
                 WHERE id = $1
                 AND user_id = $2
                 AND deleted_at IS NULL`,
                [addressId, userId]
            )
            : await client.query(
                `SELECT *
                 FROM addresses
                 WHERE user_id = $1
                 AND is_default = TRUE
                 AND deleted_at IS NULL`,
                [userId]
            );

        const address = addressResult.rows[0];

        if (!address) {
            throw addressId
                ? new NotFoundError("Shipping address not found")
                : new BadRequestError("Shipping address is required");
        }

        const shippingSnapshot = {
            full_name: address.full_name,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country
        };

        const uniqueProductIds = [
            ...new Set(
                cartItems.map(
                    item => item.product_id
                )
            )
        ];

        const productsResult = await client.query(
            `SELECT
                id,
                price,
                stock
             FROM products
             WHERE id = ANY($1::uuid[])
             AND deleted_at IS NULL
             ORDER BY id
             FOR UPDATE`,
            [uniqueProductIds]
        );

        const products = productsResult.rows;

        if (
            products.length !==
            uniqueProductIds.length
        ) {
            throw new NotFoundError(
                "One or more products not found"
            );
        }

        const quantityMap = {};

        for (const item of cartItems) {
            quantityMap[item.product_id] =
                (quantityMap[item.product_id] || 0) +
                item.quantity;
        }

        for (const product of products) {
            const requiredQuantity =
                quantityMap[product.id];

            if (
                product.stock <
                requiredQuantity
            ) {
                throw new BadRequestError(
                    `Insufficient stock for product ${product.id}`
                );
            }
        }

        let subtotalCents = 0;

        for (const item of cartItems) {
            const product = products.find(
                product => product.id === item.product_id
            );

            const unitPriceCents = Math.round(
                Number(product.price) * 100
            );

            subtotalCents += unitPriceCents * item.quantity;
        }

        const taxCents = Math.round(
            subtotalCents * TAX_RATE
        );

        const shippingCents = SHIPPING_COST_CENTS;

        const totalCents =
            subtotalCents +
            taxCents +
            shippingCents;

        const subtotal = subtotalCents / 100;
        const taxAmount = taxCents / 100;
        const shippingCost = shippingCents / 100;
        const totalPrice = totalCents / 100;

        const orderResult = await client.query(
            `INSERT INTO orders (
                user_id,
                subtotal,
                shipping_cost,
                tax_amount,
                total_price,
                shipping_address_id,
                shipping_address
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
            RETURNING *`,
            [
                userId,
                subtotal,
                shippingCost,
                taxAmount,
                totalPrice,
                address.id,
                JSON.stringify(shippingSnapshot)
            ]
        );

        const order = orderResult.rows[0];

        for (const item of cartItems) {
            const product = products.find(
                product =>
                    product.id === item.product_id
            );

            await client.query(
                `INSERT INTO order_items (
                    order_id,
                    product_id,
                    quantity,
                    price
                 )
                 VALUES ($1, $2, $3, $4)`,
                [
                    order.id,
                    item.product_id,
                    item.quantity,
                    product.price
                ]
            );
        }

        for (const productId of uniqueProductIds) {
            await client.query(
                `UPDATE products
                 SET
                    stock = stock - $1,
                    updated_at = NOW()
                 WHERE id = $2`,
                [
                    quantityMap[productId],
                    productId
                ]
            );
        }

        await client.query(
            `UPDATE cart_items
             SET
                deleted_at = NOW(),
                updated_at = NOW()
             WHERE user_id = $1
             AND deleted_at IS NULL`,
            [userId]
        );

        await client.query("COMMIT");

        return order;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getOrderByIdForStatus = async (
    id
) => {
    const result = await pool.query(
        `SELECT id, status
         FROM orders
         WHERE id = $1
         AND deleted_at IS NULL`,
        [id]
    );

    return result.rows[0];
};

const updateOrderStatus = async (
    id,
    status,
    currentStatus
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE orders
             SET
                status = $1,
                updated_at = NOW()
             WHERE id = $2
             AND status = $3
             AND deleted_at IS NULL
             RETURNING *`,
            [
                status,
                id,
                currentStatus
            ]
        );

        const updatedOrder = result.rows[0];

        if (updatedOrder && status === "cancelled") {
            const itemsResult = await client.query(
                `SELECT product_id, quantity
                 FROM order_items
                 WHERE order_id = $1`,
                [id]
            );

            for (const item of itemsResult.rows) {
                await client.query(
                    `UPDATE products
                     SET
                        stock = stock + $1,
                        updated_at = NOW()
                     WHERE id = $2`,
                    [
                        item.quantity,
                        item.product_id
                    ]
                );
            }
        }

        await client.query("COMMIT");

        return updatedOrder;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const ordersRepository = {
    getOrders,
    getOrdersById,
    getOrderItems,
    createOrder,
    getOrderByIdForStatus,
    updateOrderStatus
};

export default ordersRepository;
