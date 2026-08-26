import pool from "../db/database.js";

const findAllProducts = async (page, limit) => {
    const offset = (page - 1) * limit;

    const productsResult = await pool.query(
        `SELECT *
         FROM products
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC, id DESC
         LIMIT $1
         OFFSET $2`,
        [limit, offset]
    );

    const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM products
         WHERE deleted_at IS NULL`
    );

    return {
        products: productsResult.rows,
        total: Number(countResult.rows[0].count)
    }
};

const findProductById = async (id) => {
    const result = await pool.query(
        `SELECT *
         FROM products
         WHERE id = $1
         AND deleted_at IS NULL`,
        [id]
    );

    return result.rows[0];
};

const findProductByName = async (name) => {
    const result = await pool.query(
        `SELECT *
         FROM products
         WHERE name = $1
         AND deleted_at IS NULL`,
        [name]
    );

    return result.rows[0];
};

const addNewProduct = async (
    category_id,
    name,
    description,
    price,
    stock,
    sku
) => {
    const result = await pool.query(
        `INSERT INTO products (
            category_id,
            name,
            description,
            price,
            stock,
            sku
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            category_id,
            name,
            description,
            price,
            stock,
            sku
        ]
    );

    return result.rows[0];
};

const updateProduct = async (
    fields,
    updates,
    id
) => {
    const allowedFields = {
        category_id: "category_id",
        name: "name",
        description: "description",
        price: "price",
        stock: "stock",
        sku: "sku"
    };

    const setQuery = fields
        .map(
            (field, index) =>
                `${allowedFields[field]} = $${index + 1}`
        )
        .join(", ");

    const values = fields.map(
        field => updates[field]
    );

    values.push(id);

    const result = await pool.query(
        `UPDATE products
         SET
            ${setQuery},
            updated_at = NOW()
         WHERE id = $${values.length}
         AND deleted_at IS NULL
         RETURNING *`,
        values
    );

    return result.rows[0];
};

const deleteProduct = async (id) => {
    const result = await pool.query(
        `UPDATE products
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

const productsRepository = {
    findAllProducts,
    findProductById,
    findProductByName,
    addNewProduct,
    updateProduct,
    deleteProduct
};

export default productsRepository;