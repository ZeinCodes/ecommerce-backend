import pool from "./db/database.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await pool.query("SELECT NOW()");

        console.log("Database connected");

        app.listen(PORT, () => {
            console.log(`Server running on https://ecommerce-backend-o97abd4cl-24lights.vercel.app/api-reference`);
        });
    } catch (error) {
        console.error("Database failed to connect");
        console.error(error);
        process.exit(1);
    }
}

startServer();