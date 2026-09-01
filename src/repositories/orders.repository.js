import pool from "../db/database.js";
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
    items
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const uniqueProductIds = [
            ...new Set(
                items.map(
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

        for (const item of items) {
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

        let totalPrice = 0;

        for (const item of items) {
            const product = products.find(
                product =>
                    product.id === item.product_id
            );

            totalPrice +=
                Number(product.price) *
                item.quantity;
        }

        const orderResult = await client.query(
            `INSERT INTO orders (
                user_id,
                total_price
             )
             VALUES ($1, $2)
             RETURNING *`,
            [
                userId,
                totalPrice
            ]
        );

        const order = orderResult.rows[0];

        for (const item of items) {
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