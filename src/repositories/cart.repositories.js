import pool from "../db/database.js";

const getCartItems = async (userId) => {
    const result = await pool.query(
        `SELECT
            ci.id,
            ci.product_id,
            p.name,
            p.price,
            p.stock,
            ci.quantity,
            (p.price * ci.quantity) AS subtotal,
            ci.created_at,
            ci.updated_at
         FROM cart_items ci
         JOIN products p
            ON p.id = ci.product_id
            AND p.deleted_at IS NULL
         WHERE ci.user_id = $1
         AND ci.deleted_at IS NULL
         ORDER BY ci.created_at DESC, ci.id DESC`,
        [userId]
    );

    return result.rows;
};

const findCartItemById = async (id, userId) => {
    const result = await pool.query(
        `SELECT
            ci.id,
            ci.user_id,
            ci.product_id,
            ci.quantity
         FROM cart_items ci
         WHERE ci.id = $1
         AND ci.user_id = $2
         AND ci.deleted_at IS NULL`,
        [id, userId]
    );

    return result.rows[0];
};

const findCartItemByProduct = async (userId, productId) => {
    const result = await pool.query(
        `SELECT
            id,
            user_id,
            product_id,
            quantity
         FROM cart_items
         WHERE user_id = $1
         AND product_id = $2
         AND deleted_at IS NULL`,
        [userId, productId]
    );

    return result.rows[0];
};

const insertCartItem = async (userId, productId, quantity) => {
    const result = await pool.query(
        `INSERT INTO cart_items (
            user_id,
            product_id,
            quantity
         )
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, productId, quantity]
    );

    return result.rows[0];
};

const incrementCartItemQuantity = async (id, userId, incrementBy) => {
    const result = await pool.query(
        `UPDATE cart_items
         SET
            quantity = quantity + $1,
            updated_at = NOW()
         WHERE id = $2
         AND user_id = $3
         AND deleted_at IS NULL
         RETURNING *`,
        [incrementBy, id, userId]
    );

    return result.rows[0];
};

const updateCartItemQuantity = async (id, userId, quantity) => {
    const result = await pool.query(
        `UPDATE cart_items
         SET
            quantity = $1,
            updated_at = NOW()
         WHERE id = $2
         AND user_id = $3
         AND deleted_at IS NULL
         RETURNING *`,
        [quantity, id, userId]
    );

    return result.rows[0];
};

const deleteCartItem = async (id, userId) => {
    const result = await pool.query(
        `UPDATE cart_items
         SET
            deleted_at = NOW(),
            updated_at = NOW()
         WHERE id = $1
         AND user_id = $2
         AND deleted_at IS NULL
         RETURNING *`,
        [id, userId]
    );

    return result.rows[0];
};

const clearCart = async (client, userId) => {
    await client.query(
        `UPDATE cart_items
         SET
            deleted_at = NOW(),
            updated_at = NOW()
         WHERE user_id = $1
         AND deleted_at IS NULL`,
        [userId]
    );
};

export {
    getCartItems,
    findCartItemById,
    findCartItemByProduct,
    insertCartItem,
    incrementCartItemQuantity,
    updateCartItemQuantity,
    deleteCartItem,
    clearCart
};