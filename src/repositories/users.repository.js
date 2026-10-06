import pool from "../db/database.js";
import BadRequestError from "../errors/BadRequestError.js";

const findAllUsers = async (
    page,
    limit
) => {
    const offset =
        (page - 1) * limit;

    const usersResult =
        await pool.query(
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
            [
                limit,
                offset
            ]
        );

    const countResult =
        await pool.query(
            `SELECT COUNT(*)
             FROM users
             WHERE deleted_at IS NULL`
        );

    return {
        users: usersResult.rows,
        total:
            Number(
                countResult.rows[0].count
            )
    };
};

const findUserById = async (
    id
) => {
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

const registerUserWithVerification = async (
    name,
    email,
    passwordHash,
    tokenHash,
    expiresAt
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const userResult = await client.query(
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
                "user"
            ]
        );

        const user = userResult.rows[0];

        await client.query(
            `INSERT INTO email_verification_tokens (
                user_id,
                token_hash,
                expires_at
            )
            VALUES ($1, $2, $3)`,
            [
                user.id,
                tokenHash,
                expiresAt
            ]
        );

        await client.query("COMMIT");

        return user;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const updateUser = async (updates, id) => {
    const allowedFields = {
        name: "name",
        email: "email",
        password: "password_hash"
    };

    const fields = Object.keys(updates);

    if (fields.length === 0) {
        throw new BadRequestError(
            "No update fields provided"
        );
    }

    const invalidFields = fields.filter(
        (field) => !allowedFields[field]
    );

    if (invalidFields.length > 0) {
        throw new BadRequestError(
            `Invalid update fields: ${invalidFields.join(", ")}`
        );
    }

    let setQuery = fields
        .map(
            (field, index) =>
                `${allowedFields[field]} = $${index + 1}`
        )
        .join(", ");

    const values = fields.map(
        (field) => updates[field]
    );

    if (fields.includes("email")) {
        setQuery += ", email_verified_at = NULL";
    }

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

const deleteUser = async (
    id
) => {
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

const findUserByEmail = async (
    email
) => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            role,
            password_hash,
            email_verified_at
         FROM users
         WHERE email = $1
         AND deleted_at IS NULL`,
        [email]
    );

    return result.rows[0];
};

const registerUser = async (
    name,
    email,
    passwordHash
) => {
    const role = "user";

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
        [name, email, passwordHash, role]
    )
    return result.rows[0];
}

const replaceUserVerificationToken = async (
    userId,
    tokenHash,
    expiresAt
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `UPDATE email_verification_tokens
             SET used_at = NOW()
             WHERE user_id = $1
             AND used_at IS NULL`,
            [userId]
        );

        await client.query(
            `INSERT INTO email_verification_tokens (
                user_id,
                token_hash,
                expires_at
            )
            VALUES ($1, $2, $3)`,
            [userId, tokenHash, expiresAt]
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const verifyEmail = async (tokenHash) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const tokenResult = await client.query(
            `UPDATE email_verification_tokens
             SET used_at = NOW()
             WHERE token_hash = $1
               AND used_at IS NULL
               AND expires_at > NOW()
             RETURNING user_id`,
            [tokenHash]
        );

        if (tokenResult.rowCount === 0) {
            throw new BadRequestError("Invalid or expired verification token");
        }

        await client.query(
            `UPDATE users
             SET 
                email_verified_at = NOW(),
                updated_at = NOW()
             WHERE id = $1 
             AND deleted_at IS NULL`,
            [tokenResult.rows[0].user_id]
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const forgotPassword = async (
    userId,
    hashToken,
    expireAt,
    usedAt
) => {
    const result = await pool.query(
        `INSERT INTO password_reset_tokens (
            user_id,
            token_hash,
            expires_at,
            used_at
         )
         VALUES ($1, $2, $3, $4)
         RETURNING
            user_id,
            expires_at,
            created_at`,
        [userId, hashToken, expireAt, usedAt]
    )
    return result.rows[0]
}

const invalidateUserResetTokens = async (userId) => {
    await pool.query(
        `UPDATE password_reset_tokens
         SET used_at = NOW()
         WHERE user_id = $1
           AND used_at IS NULL`,
        [userId]
    );
};


const resetPassword = async (tokenHash, newPasswordHash) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const tokenResult = await client.query(
            `UPDATE password_reset_tokens
             SET used_at = NOW()
             WHERE token_hash = $1
                AND used_at IS NULL
                AND expires_at > NOW()
             RETURNING user_id`,
            [tokenHash]
        )

        if (tokenResult.rowCount === 0) {
            throw new BadRequestError(
                "Invalid or expired password reset token"
            )
        }

        const userId = tokenResult.rows[0].user_id;

        await client.query(
            `UPDATE users
             SET password_hash = $1,
                updated_at = NOW()
             WHERE id = $2
             AND deleted_at IS NULL`,
            [newPasswordHash, userId]
        )

        await revokeUserRefreshTokens(userId, client);

        await client.query("COMMIT")
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

const revokeUserRefreshTokens = async (userId, client = pool) => {
    await client.query(
        `DELETE FROM refresh_tokens
         WHERE user_id = $1`,
        [userId]
    );
};

export {
    findAllUsers,
    findUserById,
    addNewUser,
    registerUserWithVerification,
    updateUser,
    deleteUser,
    findUserByEmail,
    registerUser,
    forgotPassword,
    invalidateUserResetTokens,
    resetPassword,
    replaceUserVerificationToken,
    verifyEmail,
    revokeUserRefreshTokens
};