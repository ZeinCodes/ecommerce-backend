import pool from "../db/database.js";
import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";
import cloudinary from "../config/cloudinary.js";

const findAllProducts = async (
    page = 1,
    limit = 20,
    category_id,
    min_price,
    max_price,
    name,
    sortBy,
    order = "ASC"
) => {
    const offset = (page - 1) * limit;

    const conditions = ["p.deleted_at IS NULL"];
    const values = [];

    if (category_id) {
        values.push(category_id);
        conditions.push(`p.category_id = $${values.length}`);
    }

    if (min_price !== undefined) {
        values.push(min_price);
        conditions.push(`p.price >= $${values.length}`);
    }

    if (max_price !== undefined) {
        values.push(max_price);
        conditions.push(`p.price <= $${values.length}`);
    }

    if (name) {
        values.push(`%${name}%`);
        conditions.push(`p.name ILIKE $${values.length}`);
    }

    const whereClause = conditions.join(" AND ");

    const allowedSortFields = {
        created_at: "p.created_at",
        name: "p.name",
        price: "p.price",
        stock: "p.stock"
    };

    const sortColumn = allowedSortFields[sortBy] || "created_at";
    const orderDirection = (order && order.toString().toUpperCase() === "DESC") ? "DESC" : "ASC";

    const limitPlaceholder = values.length + 1;
    const offsetPlaceholder = values.length + 2;

    const productsValues = [...values, limit, offset];
    const countValues = [...values];

    const productsResult = await pool.query(
        `SELECT
            p.id,
            p.category_id,
            p.name,
            p.description,
            p.price,
            pr.average_rating,
            COALESCE(pr.reviews_count, 0) AS reviews_count,
            p.stock,
            p.sku,
            p.created_at,
            p.updated_at
         FROM products p
         LEFT JOIN (
            SELECT
                product_id,
                ROUND(AVG(rating), 2) AS average_rating,
                COUNT(*) AS reviews_count
            FROM product_reviews
            WHERE deleted_at IS NULL
            GROUP BY product_id
         ) pr ON pr.product_id = p.id
         WHERE ${whereClause}
         ORDER BY ${sortColumn} ${orderDirection}, p.id DESC
         LIMIT $${limitPlaceholder}
         OFFSET $${offsetPlaceholder}`,
        productsValues
    );

    const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM products p
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
        `SELECT
            p.id,
            p.category_id,
            p.name, 
            p.description,
            p.price,
            pr.average_rating,
            COALESCE(pr.reviews_count, 0) AS reviews_count,
            p.stock,
            p.sku,
            p.created_at,
            p.updated_at 
         FROM products p 
         LEFT JOIN (
            SELECT 
                product_id,
                ROUND(AVG(rating), 2) AS average_rating,
                COUNT(*) AS reviews_count
            FROM product_reviews 
            WHERE deleted_at IS NULL
            GROUP BY product_id 
         ) pr ON pr.product_id = p.id
         WHERE p.id = $1
         AND p.deleted_at IS NULL`,
        [id]
    );

    return result.rows[0];
};

const findProductByName = async (name) => {
    const result = await pool.query(
        `SELECT
            p.id,
            p.category_id,
            p.name, 
            p.description,
            p.price,
            pr.average_rating,
            COALESCE(pr.reviews_count, 0) AS reviews_count,
            p.stock,
            p.sku,
            p.created_at,
            p.updated_at 
         FROM products p 
         LEFT JOIN (
            SELECT 
                product_id,
                ROUND(AVG(rating), 2) AS average_rating,
                COUNT(*) AS reviews_count
            FROM product_reviews 
            WHERE deleted_at IS NULL
            GROUP BY product_id 
         ) pr ON pr.product_id = p.id
         WHERE p.name = $1
         AND p.deleted_at IS NULL`,
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

const updateProduct = async (fields, updates, id) => {
    const allowedFields = {
        category_id: "category_id",
        name: "name",
        description: "description",
        price: "price",
        stock: "stock",
        sku: "sku"
    };

    if (!fields || fields.length === 0) {
        throw new BadRequestError("No update fields provided");
    }

    const invalidFields = fields.filter(
        field => !allowedFields[field]
    );

    if (invalidFields.length > 0) {
        throw new BadRequestError(
            `Invalid update fields: ${invalidFields.join(", ")}`
        );
    }

    const setQuery = fields
        .map((field, index) => `${allowedFields[field]} = $${index + 1}`)
        .join(", ");

    const values = fields.map(field => updates[field]);
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

    if (!result.rows[0]) {
        throw new NotFoundError("Product not found")
    }

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
    
    if (!result.rows[0]) {
        throw new NotFoundError("Product not found")
    }

    return result.rows[0];
};

const getImages = async (productId) => {
    const result = await pool.query(
        `SELECT 
            id,
            image_url
         FROM product_images
         WHERE product_id = $1`,
        [productId]
    )
    return result.rows;
}

const findImageById = async (productId, imageId) => {
    const result = await pool.query(
        `SELECT 
            id,
            image_url
         FROM product_images
         WHERE id = $1
         AND product_id = $2`,
        [imageId, productId]
    )
    return result.rows[0];
}

const uploadBuffer = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "ecommerce/products" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });

const postImages = async (productId, files) => {
    const uploads = await Promise.all(
        files.map((file) => uploadBuffer(file.buffer))
    );

    const imageUrls = uploads.map((upload) => upload.secure_url);

    const placeholders = imageUrls.map((_, index) => {
        return `($1, $${index + 2})`;
    });

    const values = [productId, ...imageUrls];

    const result = await pool.query(
        `INSERT INTO product_images (
            product_id,
            image_url
         )
         VALUES ${placeholders.join(", ")}
         RETURNING *`,
        values
    );

    return result.rows;
};

const getPublicId = (url) => {
    const match = url.match(/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    return match ? match[1] : null;
};

const deleteImage = async (productId, imageId) => {
    const image = await findImageById(productId, imageId);

    if (!image) {
        return null;
    }

    await pool.query(
        `DELETE FROM product_images
            WHERE product_id = $1
            AND id = $2`,
        [productId, imageId]
    );

    const publicId = getPublicId(image.image_url);

    if (publicId) {
        await cloudinary.uploader.destroy(publicId);
    }

    return image;
};

const productsRepository = {
    findAllProducts,
    findProductById,
    findProductByName,
    addNewProduct,
    updateProduct,
    deleteProduct,
    getImages,
    findImageById,
    postImages,
    deleteImage
};

export default productsRepository;