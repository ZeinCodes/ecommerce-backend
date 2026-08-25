import pool from "../db/database.js";

const getOrders = async (userId) => {
    const result = await pool.query(
        `SELECT *
         FROM orders
         WHERE user_id = $1
         AND deleted_at IS NULL
         ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
};

const getOrdersById = async (id, userId) => {
    const result = await pool.query(
        `SELECT *
         FROM orders
         WHERE id = $1
         AND user_id = $2
         AND deleted_at IS NULL`,
        [id, userId]
    );

    return result.rows[0];
};

const getOrderItems = async (id, userId) => {
    const result = await pool.query(
        `SELECT
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
         AND o.user_id = $2
         AND o.deleted_at IS NULL
         ORDER BY oi.created_at`,
        [id, userId]
    );

    return result.rows;
};

const createOrder = async (userId, items) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const productIds = items.map(item => item.product_id);

        const productsResult = await client.query(
            `SELECT
                id,
                price,
                stock
             FROM products
             WHERE id = ANY($1::uuid[])
             AND deleted_at IS NULL
             FOR UPDATE`,
            [productIds]
        );

        const products = productsResult.rows;

        if (products.length !== productIds.length) {
            throw new Error("One or more products not found");
        }

        let totalPrice = 0;

        for (const item of items) {
            const product = products.find(
                product => product.id === item.product_id
            );

            if (product.stock < item.quantity) {
                throw new Error(
                    `Insufficient stock for product ${item.product_id}`
                );
            }

            totalPrice += Number(product.price) * item.quantity;
        }

        const orderResult = await client.query(
            `INSERT INTO orders (
                user_id,
                total_price
             )
             VALUES ($1, $2)
             RETURNING *`,
            [userId, totalPrice]
        );

        const order = orderResult.rows[0];

        for (const item of items) {
            const product = products.find(
                product => product.id === item.product_id
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

            await client.query(
                `UPDATE products
                 SET
                    stock = stock - $1,
                    updated_at = NOW()
                 WHERE id = $2`,
                [
                    item.quantity,
                    item.product_id
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

const getOrderByIdForStatus = async (id) => {
    const result = await pool.query(
        `SELECT id, status
         FROM orders
         WHERE id = $1
         AND deleted_at IS NULL`,
        [id]
    );

    return result.rows[0];
};

const updateOrderStatus = async (id, status) => {
    const result = await pool.query(
        `UPDATE orders
         SET
            status = $1,
            updated_at = NOW()
         WHERE id = $2
         AND deleted_at IS NULL
         RETURNING *`,
        [status, id]
    );

    return result.rows[0];
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