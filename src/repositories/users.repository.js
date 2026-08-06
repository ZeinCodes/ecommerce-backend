import pool from "../db/database.js";

const findAllUsers = async () => {
    const result = await pool.query(
        `SELECT * FROM users
        WHERE deleted_at IS NULL`
        
    )
    return result.rows;
}

const findUserById = async(id) => {
    const result = await pool.query(
        `SELECT * FROM users 
        WHERE id = $1
        AND deleted_at IS NULL`,
        [id]
    )
    return result.rows[0]
};

const addNewUser = async(
    name, email,
    password, role
) => {
    const result = await pool.query(
        `INSERT INTO users(
        name, email,
        password_hash, role
        ) 
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at`, 
        [
            name, 
            email, 
            password, 
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
};

const deleteUser = async (id) => {
    const result = await pool.query(
        `UPDATE users
        SET deleted_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        AND deleted_at IS NULL
        RETURNING *`,
        [id]
    );

    return result.rows[0];
}; 

const findUserByEmail = async (email) => {
    console.log("Repo")
    const result = await pool.query(
        `SELECT
        id, name, email, role, password_hash 
        FROM users
        WHERE email = $1
        AND deleted_at IS NULL`,
        [email]
    )
    return result.rows[0];
}

export {
    findAllUsers,
    findUserById,
    addNewUser,
    updateUser,
    deleteUser,
    findUserByEmail
}; 