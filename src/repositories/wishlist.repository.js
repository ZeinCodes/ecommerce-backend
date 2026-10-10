
import pool from "../db/database.js";

const getWishlistItems = async (userId) => {
    const result = await pool.query(
        `SELECT
            w.id AS wishlist_item_id,
            p.id AS product_id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.sku,
            w.created_at AS added_at
        FROM wishlist_items w
        INNER JOIN products p
            ON p.id = w.product_id
        WHERE w.user_id = $1
            AND p.deleted_at IS NULL
        ORDER BY w.created_at DESC`,
        [userId]
    );

    return result.rows;
};

const addWishlistItem = async (userId, productId) => {
    const result = await pool.query(
        `INSERT INTO wishlist_items (user_id, product_id)
         SELECT $1, p.id
         FROM products p
         WHERE p.id = $2
           AND p.deleted_at IS NULL
         RETURNING id, user_id, product_id, created_at`,
        [userId, productId]
    );

    return result.rows[0];
};

const removeWishlistItem = async (userId, productId) => {
    const result = await pool.query(
        `DELETE FROM wishlist_items
         WHERE user_id = $1
           AND product_id = $2
         RETURNING id, user_id, product_id, created_at`,
        [userId, productId]
    );

    return result.rows[0];
};

export {
    getWishlistItems,
    addWishlistItem,
    removeWishlistItem
};