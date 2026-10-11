import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const ssl = process.env.DB_CA_CERT
    ? { ca: process.env.DB_CA_CERT, rejectUnauthorized: true }
    : { rejectUnauthorized: isProduction };

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl
});

export default pool;