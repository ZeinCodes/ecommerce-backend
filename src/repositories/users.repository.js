import pool from "../db/database.js";

const findAllOrById = async (id) => {
    if (!id) {
        const result = await pool.query(
            'SELECT * FROM users'
        )
        return result;
    }
    const result = await pool.query(
        `SELECT * FROM users 
        WHERE id = $1`
        [id]
    );
    return result.rows;
}

export default findAllOrById; 