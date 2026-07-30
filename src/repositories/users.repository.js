import pool from "../db/database.js";

const findAllUsers = async () => {
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

const addNewUser = async(
    name, email,
    password_hash, role
) => {
    const result = await pool.query(
        `INSERT INTO users(
        name, email,
        password_hash, role
        ) 
        VALUES ($1, $2, $3, $4)
        RETURNING *`, 
        [
            name, 
            email, 
            password_hash, 
            role
        ]
        
    )
    return result.rows[0]
}

const updateUser = async (fields, updates, id) => {
    const setQuery = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

    const values = fields.map(field => updates[field]);
    values.push(id);

    const result = await pool.query(
        `UPDATE users
        SET 
            ${setQuery},
            updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING *`,
        values
    )
    return result.rows[0];
}

export {
    findAllUsers,
    findUserById,
    addNewUser,
    updateUser
}; 