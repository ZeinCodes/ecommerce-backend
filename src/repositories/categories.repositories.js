import pool from "../db/database.js";

const findAllCategories = async () => {
    const result = await pool.query(
        `SELECT *
         FROM categories
         WHERE deleted_at IS NULL`
    );

    return result.rows;
};

const findCategoryById = async (id) => {
    const result = await pool.query(
        `SELECT *
         FROM categories
         WHERE id = $1
         AND deleted_at IS NULL`,
        [id]
    );

    return result.rows[0];
};

const findCategoryByName = async (name) => {
    const result = await pool.query(
        `SELECT *
         FROM categories
         WHERE name = $1
         AND deleted_at IS NULL`,
        [name]
    );

    return result.rows[0];
};

const addNewCategory = async (name) => {
    const result = await pool.query(
        `INSERT INTO categories
         VALUES ($1)
         RETURNING *`,
         [name]
    );

    return result.rows[0];
};

const updateCategory = async (id, name) => {
    const result = await pool.query(
        `UPDATE categories
         SET
            name = $1,
            updated_at = NOW()
         WHERE id = $2
         AND deleted_at IS NULL
         RETURNING *`,
        [name, id]
    );

    return result.rows[0];
};

const deleteCategory = async (id) => {
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
    findCategoryByName,
    addNewCategory,
    updateCategory,
    deleteCategory
};

export default categoriesRepository;