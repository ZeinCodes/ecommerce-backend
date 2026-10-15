import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const ssl = process.env.DB_CA_CERT
? {
    ca: process.env.DB_CA_CERT.replace(/\\n/g, "\n"),
    rejectUnauthorized: true,
}
: isProduction
? { rejectUnauthorized: true }
: false;


const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl
});

pool.on("error", (error) => {
    console.error(
        "Unexpected error on idle PostgreSQL client:",
        error.message
    );
});

export default pool;