import pool from "../db/database.js"

const createRefreshToken = async (
    userId, tokenHash, expiresAt
) => {
    const result = await pool.query(
        `INSERT INTO refresh_tokens(
            user_id,
            token_hash,
            expires_at
         ) VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
    )
    return result;
}

const findRefreshTokenByHash = async (tokenHash) => {
    const result = await pool.query(
        `SELECT *
         FROM refresh_tokens
         WHERE token_hash = $1`,
        [tokenHash]
    );

    return result.rows[0];
};

const deleteRefreshToken = async (tokenHash) => {
    const result = await pool.query(
        `DELETE FROM refresh_tokens
         WHERE token_hash = $1
         RETURNING *`,
        [tokenHash]
    )
    return result.rows[0];
}

// Deletes the old token and stores the new one in a single transaction,
// so a failure never leaves the user without a valid session.
// Returns "rotated", "missing" (old token not found / already used) or "expired".
const rotateRefreshToken = async (
    oldTokenHash,
    userId,
    newTokenHash,
    newExpiresAt
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const deleted = await client.query(
            `DELETE FROM refresh_tokens
             WHERE token_hash = $1
             RETURNING user_id, expires_at`,
            [oldTokenHash]
        );

        const oldToken = deleted.rows[0];

        if (!oldToken || String(oldToken.user_id) !== String(userId)) {
            await client.query("ROLLBACK");
            return "missing";
        }

        if (
            oldToken.expires_at &&
            new Date(oldToken.expires_at) <= new Date()
        ) {
            // Keep the delete: an expired token is useless anyway
            await client.query("COMMIT");
            return "expired";
        }

        await client.query(
            `INSERT INTO refresh_tokens(
                user_id,
                token_hash,
                expires_at
             ) VALUES ($1, $2, $3)`,
            [userId, newTokenHash, newExpiresAt]
        );

        await client.query("COMMIT");

        return "rotated";
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export {
    createRefreshToken,
    findRefreshTokenByHash,
    deleteRefreshToken,
    rotateRefreshToken
}
