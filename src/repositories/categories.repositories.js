import pool from "../db/database.js";

const findAllCategories = async (
    page,
    limit,
    name
) => {
    const offset = (page - 1) * limit;

    const conditions = [
        "deleted_at IS NULL"
    ];

    const values = [];

    if (name) {
        values.push(`%${name}%`);

        conditions.push(
            `name ILIKE $${values.length}`
        );
    }

    const whereClause =
        conditions.join(" AND ");

    const limitPlaceholder =
        values.length + 1;

    const offsetPlaceholder =
        values.length + 2;

    const categoriesResult =
        await pool.query(
            `SELECT *
             FROM categories
             WHERE ${whereClause}
             ORDER BY created_at DESC, id DESC
             LIMIT $${limitPlaceholder}
             OFFSET $${offsetPlaceholder}`,
            [
                ...values,
                limit,
                offset
            ]
        );

    const countResult =
        await pool.query(
            `SELECT COUNT(*)
             FROM categories
             WHERE ${whereClause}`,
            values
        );

    return {
        categories:
            categoriesResult.rows,

        total:
            Number(
                countResult.rows[0].count
            )
    };
};

const findCategoryById = async (
    id
) => {
    const result = await pool.query(
        `SELECT *
         FROM categories
         WHERE id = $1
         AND deleted_at IS NULL`,
        [id]
    );

    return result.rows[0];
};

const addNewCategory = async (
    name
) => {
    const result = await pool.query(
        `INSERT INTO categories (name)
         VALUES ($1)
         RETURNING *`,
        [name]
    );

    return result.rows[0];
};

const updateCategory = async (
    id,
    name
) => {
    const result = await pool.query(
        `UPDATE categories
         SET
            name = $1,
            updated_at = NOW()
         WHERE id = $2
         AND deleted_at IS NULL
         RETURNING *`,
        [
            name,
            id
        ]
    );

    return result.rows[0];
};

const deleteCategory = async (
    id
) => {
    const result = await pool.query(
        `UPDATE categories
         SET
            deleted_at = NOW(),
            updated_at = NOW()
         WHERE id = $1
         AND deleted_at IS NULL
         RETURNING *`,
        [id]
    );

    return result.rows[0];
};

const categoriesRepository = {
    findAllCategories,
    findCategoryById,
    addNewCategory,
    updateCategory,
    deleteCategory
};

export default categoriesRepository;