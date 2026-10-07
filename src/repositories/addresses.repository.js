import pool from "../db/database.js";
import BadRequestError from "../errors/BadRequestError.js";

const findAllByUser = async (userId) => {
    const result = await pool.query(
        `SELECT *
         FROM addresses
         WHERE user_id = $1
         AND deleted_at IS NULL
         ORDER BY is_default DESC, created_at DESC, id DESC`,
        [userId]
    );

    return result.rows;
};

const findById = async (id, userId) => {
    const result = await pool.query(
        `SELECT *
         FROM addresses
         WHERE id = $1
         AND user_id = $2
         AND deleted_at IS NULL`,
        [id, userId]
    );

    return result.rows[0];
};

const createAddress = async (userId, data) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const countResult = await client.query(
            `SELECT COUNT(*)
             FROM addresses
             WHERE user_id = $1
             AND deleted_at IS NULL`,
            [userId]
        );

        const isFirst = Number(countResult.rows[0].count) === 0;
        const makeDefault = data.is_default === true || isFirst;

        if (makeDefault) {
            await client.query(
                `UPDATE addresses
                 SET
                    is_default = FALSE,
                    updated_at = NOW()
                 WHERE user_id = $1
                 AND is_default = TRUE
                 AND deleted_at IS NULL`,
                [userId]
            );
        }

        const result = await client.query(
            `INSERT INTO addresses (
                user_id,
                full_name,
                phone,
                street,
                city,
                state,
                postal_code,
                country,
                is_default
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                userId,
                data.full_name,
                data.phone ?? null,
                data.street,
                data.city,
                data.state ?? null,
                data.postal_code,
                data.country,
                makeDefault
            ]
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const updateAddress = async (id, userId, updates) => {
    const allowedFields = {
        full_name: "full_name",
        phone: "phone",
        street: "street",
        city: "city",
        state: "state",
        postal_code: "postal_code",
        country: "country",
        is_default: "is_default"
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
    values.push(id, userId);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        if (updates.is_default === true) {
            await client.query(
                `UPDATE addresses
                 SET is_default = FALSE, updated_at = NOW()
                 WHERE user_id = $1
                 AND id <> $2
                 AND is_default = TRUE
                 AND deleted_at IS NULL`,
                [userId, id]
            );
        }

        const result = await client.query(
            `UPDATE addresses
             SET
                ${setQuery},
                updated_at = NOW()
             WHERE id = $${values.length - 1}
             AND user_id = $${values.length}
             AND deleted_at IS NULL
             RETURNING *`,
            values
        );

        if (!result.rows[0]) {
            await client.query("ROLLBACK");
            return undefined;
        }

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const deleteAddress = async (id, userId) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existing = await client.query(
            `SELECT id, is_default
             FROM addresses
             WHERE id = $1
             AND user_id = $2
             AND deleted_at IS NULL
             FOR UPDATE`,
            [id, userId]
        );

        if (!existing.rows[0]) {
            await client.query("ROLLBACK");
            return undefined;
        }

        const wasDefault = existing.rows[0].is_default;

        const result = await client.query(
            `UPDATE addresses
             SET
                deleted_at = NOW(),
                updated_at = NOW(),
                is_default = FALSE
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (wasDefault) {
            await client.query(
                `UPDATE addresses
                 SET is_default = TRUE, updated_at = NOW()
                 WHERE id = (
                    SELECT id
                    FROM addresses
                    WHERE user_id = $1
                    AND deleted_at IS NULL
                    ORDER BY created_at DESC, id DESC
                    LIMIT 1
                 )`,
                [userId]
            );
        }

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const addressesRepository = {
    findAllByUser,
    findById,
    createAddress,
    updateAddress,
    deleteAddress
};

export default addressesRepository;