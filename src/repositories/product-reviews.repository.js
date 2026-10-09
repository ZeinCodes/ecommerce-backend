import pool from "../db/database.js";
import BadRequestError from "../errors/BadRequestError.js";

const findAllReviews = async (
    productId,
    page,
    limit
) => {
    const offset = (page - 1) * limit;

    const reviewsResult = await pool.query(
        `SELECT *
         FROM product_reviews
         WHERE product_id = $1
         AND deleted_at IS NULL
         ORDER BY created_at DESC, id DESC
         LIMIT $2
         OFFSET $3`,
        [productId, limit, offset]
    );

    const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM product_reviews
         WHERE product_id = $1
         AND deleted_at IS NULL`,
        [productId]
    );

    return {
        reviews: reviewsResult.rows,
        total: Number(countResult.rows[0].count)
    };
};

const findReviewById = async (id, productId) => {
    const result = await pool.query(
        `SELECT *
         FROM product_reviews
         WHERE id = $1
         AND product_id = $2
         AND deleted_at IS NULL`,
        [id, productId]
    );

    return result.rows[0];
};

const addNewReview = async (
    userId,
    productId,
    rating,
    user_comment
) => {
    const result = await pool.query(
        `INSERT INTO product_reviews (
            user_id,
            product_id,
            rating,
            user_comment
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
            userId,
            productId,
            rating,
            user_comment ?? null
        ]
    );

    return result.rows[0];
};

const updateReview = async (id, productId, userId, updates) => {
    const allowedFields = {
        rating: "rating",
        user_comment: "user_comment"
    };

    const fields = Object.keys(updates);

    if (fields.length === 0) {
        throw new BadRequestError("No update fields provided");
    }

    const invalidFields = fields.filter(
        (field) => !allowedFields[field]
    );

    if (invalidFields.length > 0) {
        throw new BadRequestError(
            `Invalid update fields: ${invalidFields.join(", ")}`
        );
    }

    const setQuery = fields
        .map((field, index) => `${allowedFields[field]} = $${index + 1}`)
        .join(", ");

    const values = fields.map((field) => updates[field]);
    values.push(id, productId, userId);

    const result = await pool.query(
        `UPDATE product_reviews
         SET
            ${setQuery},
            updated_at = NOW()
         WHERE id = $${values.length - 2}
         AND product_id = $${values.length - 1}
         AND user_id = $${values.length}
         AND deleted_at IS NULL
         RETURNING *`,
        values
    );

    return result.rows[0];
};

const deleteReview = async (id, productId, userId) => {
    const result = await pool.query(
        `UPDATE product_reviews
         SET
            deleted_at = NOW(),
            updated_at = NOW()
         WHERE id = $1
         AND product_id = $2
         AND user_id = $3
         AND deleted_at IS NULL
         RETURNING *`,
        [id, productId, userId]
    );

    return result.rows[0];
};

const reviewsRepository = {
    findAllReviews,
    findReviewById,
    addNewReview,
    updateReview,
    deleteReview
};

export default reviewsRepository;