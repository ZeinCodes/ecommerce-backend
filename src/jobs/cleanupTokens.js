import pool from "../db/database.js";

const SIX_HOURS = 6 * 60 * 60 * 1000;

export const cleanupExpiredTokens = async () => {
    try {
        await pool.query(
            `DELETE FROM refresh_tokens
             WHERE expires_at < NOW()`
        );

        await pool.query(
            `DELETE FROM email_verification_tokens
             WHERE expires_at < NOW() OR used_at IS NOT NULL`
        );

        await pool.query(
            `DELETE FROM password_reset_tokens
             WHERE expires_at < NOW() OR used_at IS NOT NULL`
        );
    } catch (error) {
        console.error("Token cleanup failed:", error);
    }
};

// Returns the timer so the caller can stop it on shutdown.
export const startTokenCleanup = () => {
    cleanupExpiredTokens();

    const timer = setInterval(cleanupExpiredTokens, SIX_HOURS);
    timer.unref();

    return timer;
};
