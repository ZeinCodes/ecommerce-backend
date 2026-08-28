import pool from "../db/database.js";

const findAllProducts = async (
    page,
    limit,
    category_id,
    min_price,
    max_price,
    name
) => {
    const offset = (page - 1) * limit;

    const conditions = ["deleted_at IS NULL"];
    const values = [];

    if (category_id) {
        values.push(category_id);
        conditions.push(
            `category_id = $${values.length}`
        );
    }

    if (min_price !== undefined) {
        values.push(min_price);
        conditions.push(
            `price >= $${values.length}`
        );
    }

    if (max_price !== undefined) {
        values.push(max_price);
        conditions.push(
            `price <= $${values.length}`
        );
    }

    if (name) {
        values.push(`%${name}%`);
        conditions.push(
            `name ILIKE $${values.length}`
        );
    }

    const whereClause = conditions.join(" AND ");

    const limitPlaceholder = values.length + 1;
    const offsetPlaceholder = values.length + 2;

    const productsValues = [
        ...values,
        limit,
        offset
    ];

    const countValues = [
        ...values
    ];

    const productsResult = await pool.query(
        `SELECT *
         FROM products
         WHERE ${whereClause}
         ORDER BY created_at DESC, id DESC
         LIMIT $${limitPlaceholder}
         OFFSET $${offsetPlaceholder}`,
        productsValues
    );

    const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM products
         WHERE ${whereClause}`,
        countValues
    );

    return {
        products: productsResult.rows,
        total: Number(countResult.rows[0].count)
    };
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