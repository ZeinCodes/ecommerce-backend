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

export {
    createRefreshToken,
    findRefreshTokenByHash,
    deleteRefreshToken
}