import "dotenv/config";
import pool from "./db/database.js";
import app from "./app.js";
import { startTokenCleanup } from "./jobs/cleanupTokens.js";

const PORT = process.env.PORT || 3000;

const REQUIRED_ENV = [
    "DB_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET"
];

async function startServer() {
    const missing = REQUIRED_ENV.filter((name) => !process.env[name]);

    if (missing.length > 0) {
        console.error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
        process.exit(1);
    }

    try {
        await pool.query("SELECT NOW()");

        console.log("Database connected");
    } catch (error) {
        console.error("Database failed to connect");
        console.error(error);
        process.exit(1);
    }

    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}/api-reference`);
    });

    const cleanupTimer = startTokenCleanup();

    let shuttingDown = false;

    const shutdown = (signal) => {
        if (shuttingDown) return;
        shuttingDown = true;

        console.log(`${signal} received, shutting down...`);

        clearInterval(cleanupTimer);

        server.close(async () => {
            try {
                await pool.end();
            } catch (error) {
                console.error("Error while closing the database pool:", error);
            }

            process.exit(0);
        });

        // Force exit if connections do not close in time
        setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
