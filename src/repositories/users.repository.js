import pool from "../db/database.js";

const findAllUsers = async () => {

    console.log("repo reached");
    
    const result = await pool.query(
        'SELECT * FROM users'
    )
    return result.rows;
}

const findUserById = async(id) => {
    const result = await pool.query(
        `SELECT * FROM users 
        WHERE id = $1`,
        [id]
    )
    return result.rows[0]
};

export {
    findAllUsers,
    findUserById
}; 