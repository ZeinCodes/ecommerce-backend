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

    const sortColumn = allowedSortFields[sortBy] || "p.created_at";
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


const addNewProduct = async (
    category_id,
    name,
    description,
    price,
    stock,
    sku
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const categoryResult = await client.query(
            `SELECT id
             FROM categories
             WHERE id = $1
             AND deleted_at IS NULL
             FOR UPDATE`,
            [category_id]
        );

        if (!categoryResult.rows[0]) {
            throw new NotFoundError("Category not found");
        }

        const result = await client.query(
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
            [category_id, name, description, price, stock, sku]
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK").catch(() => { });
        throw error;
    } finally {
        client.release();
    }
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
    values.push(id);

    const updateQuery = `
        UPDATE products
        SET ${setQuery},
            updated_at = NOW()
        WHERE id = $${values.length}
        AND deleted_at IS NULL
        RETURNING *
    `;

    // If the category is not changing, keep the simple update path.
    if (!fields.includes("category_id")) {
        const result = await pool.query(updateQuery, values);

        if (!result.rows[0]) {
            throw new NotFoundError("Product not found");
        }

        return result.rows[0];
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const categoryResult = await client.query(
            `SELECT id
             FROM categories
             WHERE id = $1
             AND deleted_at IS NULL
             FOR UPDATE`,
            [updates.category_id]
        );

        if (!categoryResult.rows[0]) {
            throw new NotFoundError("Category not found");
        }

        const result = await client.query(updateQuery, values);

        if (!result.rows[0]) {
            throw new NotFoundError("Product not found");
        }

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK").catch(() => { });
        throw error;
    } finally {
        client.release();
    }
};


const deleteProduct = async (id) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
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
            await client.query("ROLLBACK");
            throw new NotFoundError("Product not found");
        }

        // A deleted product must not stay in anyone's cart,
        // otherwise checkout could never succeed for those users.
        await client.query(
            `UPDATE cart_items
             SET
                deleted_at = NOW(),
                updated_at = NOW()
             WHERE product_id = $1
             AND deleted_at IS NULL`,
            [id]
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        // ROLLBACK is harmless if it was already issued above
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
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

const MAX_IMAGES_PER_PRODUCT = 3;

// Best-effort removal of files that were uploaded but never saved in the DB.
const destroyUploads = async (uploads) => {
    const results = await Promise.allSettled(
        uploads.map((upload) =>
            cloudinary.uploader.destroy(upload.public_id)
        )
    );

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            console.error(
                `Failed to clean up Cloudinary image ${uploads[index].public_id}:`,
                result.reason
            );
        }
    });
};

const postImages = async (productId, files) => {
    // allSettled so we know exactly which files reached Cloudinary,
    // even when one of the uploads fails.
    const settled = await Promise.allSettled(
        files.map((file) => uploadBuffer(file.buffer))
    );

    const uploads = settled
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

    const failedUpload = settled.find(
        (result) => result.status === "rejected"
    );

    if (failedUpload) {
        await destroyUploads(uploads);
        throw failedUpload.reason;
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lock the product row so concurrent uploads can't exceed the limit.
        const productResult = await client.query(
            `SELECT id
             FROM products
             WHERE id = $1
             AND deleted_at IS NULL
             FOR UPDATE`,
            [productId]
        );

        if (!productResult.rows[0]) {
            throw new NotFoundError("Product not found");
        }

        const countResult = await client.query(
            `SELECT COUNT(*)
             FROM product_images
             WHERE product_id = $1`,
            [productId]
        );

        const existingCount = Number(countResult.rows[0].count);

        if (existingCount + uploads.length > MAX_IMAGES_PER_PRODUCT) {
            throw new BadRequestError(
                `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images`
            );
        }

        const placeholders = uploads.map((_, index) => {
            return `($1, $${index + 2})`;
        });

        const values = [
            productId,
            ...uploads.map((upload) => upload.secure_url)
        ];

        const result = await client.query(
            `INSERT INTO product_images (
                product_id,
                image_url
             )
             VALUES ${placeholders.join(", ")}
             RETURNING *`,
            values
        );

        await client.query("COMMIT");

        return result.rows;
    } catch (error) {
        await client.query("ROLLBACK").catch(() => { });

        // The DB write failed, so the files on Cloudinary would be orphaned.
        await destroyUploads(uploads);

        throw error;
    } finally {
        client.release();
    }
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
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            // The DB row is already gone; do not fail the request,
            // but keep a trace so the orphaned file can be cleaned up.
            console.error(
                `Failed to delete Cloudinary image ${publicId}:`,
                error
            );
        }
    }

    return image;
};

const productsRepository = {
    findAllProducts,
    findProductById,
    addNewProduct,
    updateProduct,
    deleteProduct,
    getImages,
    findImageById,
    postImages,
    deleteImage
};

export default productsRepository;
