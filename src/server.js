import "dotenv/config";

import pool from "./db/database.js";
import app from "./app.js";
import { startTokenCleanup } from "./jobs/cleanupTokens.js";

const PORT = process.env.PORT || 3000;

const REQUIRED_ENV = [
    "DB_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
];

const REQUIRED_IN_PRODUCTION = [
    "FRONTEND_URL",
    "MAIL_FROM",
    "RESEND_API_KEY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CORS_ORIGIN",
];

// Handle unexpected errors from idle PostgreSQL clients.
pool.on("error", (error) => {
    console.error(
        "Unexpected error on idle PostgreSQL client:",
        error.message
    );
});

function validateEnvironment() {
    const required =
        process.env.NODE_ENV === "production"
            ? [...REQUIRED_ENV, ...REQUIRED_IN_PRODUCTION]
            : REQUIRED_ENV;

    const missing = required.filter(
        (name) => !process.env[name]?.trim()
    );

    if (missing.length > 0) {
        console.error(
            `Missing required environment variables: ${missing.join(", ")}`
        );

        process.exit(1);
    }
}

async function startServer() {
    // Validate environment variables before starting the application.
    validateEnvironment();

    try {
        // Verify that the database is reachable.
        await pool.query("SELECT NOW()");

        console.log("Database connected");
    } catch (error) {
        console.error("Database failed to connect:", error.message);
        process.exit(1);
    }

    const server = app.listen(PORT, () => {
        console.log(
            `Server running on http://localhost:${PORT}/api-reference`
        );
    });

    const cleanupTimer = startTokenCleanup();

    let shuttingDown = false;

    function shutdown(signal) {
        if (shuttingDown) return;

        shuttingDown = true;

        console.log(`${signal} received, shutting down...`);

        clearInterval(cleanupTimer);

        // Stop accepting new requests, then close the database pool.
        server.close(async () => {
            try {
                await pool.end();
                console.log("Database pool closed");
                process.exit(0);
            } catch (error) {
                console.error(
                    "Error while closing the database pool:",
                    error.message
                );

                process.exit(1);
            }
        });

        // Force exit if connections do not close within 10 seconds.
        setTimeout(() => {
            process.exit(1);
        }, 10000).unref();
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();