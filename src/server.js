import pool from './db/database.js';
import app from './app.js'

const PORT = process.env.PORT || 3000;
 
async function startServer() {
    try {
        await pool.query("SELECT NOW()");
        console.log("Database connected");
        app.listen(PORT, () => {
            console.log(`server running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.log("Database failed to connect")
        console.log(error)
    }
}

startServer();