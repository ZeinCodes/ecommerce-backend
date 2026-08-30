import pool from "../db/database.js";

const findAllUsers = async (page, limit) => {
    const offset = (page - 1)  * limit;

    const usersResult = await pool.query(
        `SELECT
            id,
            name,
            email,
            role,
            created_at,
            updated_at
         FROM users
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC, id DESC
         LIMIT $1
         OFFSET $2`,
         [limit, offset]
    );

    const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM users
         WHERE deleted_at IS NULL`
    )

    return {
        users: usersResult.rows,
        total: Number(countResult.rows[0].count)
    };
};

const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            role,
            created_at,
            updated_at
         FROM users
         WHERE id = $1
         AND deleted_at IS NULL`,
        [id]
    );

    return result.rows[0];
};

const addNewUser = async (
    name,
    email,
    passwordHash,
    role
) => {
    const result = await pool.query(
        `INSERT INTO users (
            name,
            email,
            password_hash,
            role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            name,
            email,
            role,
            created_at`,
        [
            name,
            email,
            passwordHash,
            role
        ]
    );

    return result.rows[0];
};

const updateUser = async (updates, id) => {
    const allowedFields = {
        name: "name",
        email: "email",
        password: "password_hash"
    };

    const fields = Object.keys(updates);

    const invalidFields = fields.filter(
        field => !allowedFields[field]
    );

    if (invalidFields.length > 0) {
        throw new Error(
            `Invalid update fields: ${invalidFields.join(", ")}`
        );
    }
    
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
        `UPDATE users
         SET
            ${setQuery},
            updated_at = NOW()
         WHERE id = $${values.length}
         AND deleted_at IS NULL
         RETURNING
            id,
            name,
            email,
            role,
            created_at,
            updated_at`,
        values
    );

    return result.rows[0];
};

const deleteUser = async (id) => {
    const result = await pool.query(
        `UPDATE users
         SET
            deleted_at = NOW(),
            updated_at = NOW()
         WHERE id = $1
         AND deleted_at IS NULL
         RETURNING
            id,
            name,
            email,
            role,
            created_at,
            updated_at`,
        [id]
    );

    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            role,
            password_hash
         FROM users
         WHERE email = $1
         AND deleted_at IS NULL`,
        [email]
    );

    return result.rows[0];
};

export {
    findAllUsers,
    findUserById,
    addNewUser,
    updateUser,
    deleteUser,
    findUserByEmail
};