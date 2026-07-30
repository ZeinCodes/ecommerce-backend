import * as usersRepository from '../repositories/users.repository.js';

const getUsers = async() => {
    const users = await usersRepository.findAllUsers();
    if (!users) {
        throw new Error("There is no users in the system");
    }
    return users;
}

const getUserById = async(id) => {
    const user = await usersRepository.findUserById(id);
    if (!user) {
        throw new Error("No user has this id!")
    }
    return user;
}

const postUser = async(
    name, email,
    password_hash, role
) => { 
    const validRole = ["admin", "user"];    
    
    if (!name || !email || !password_hash || !role) {
        throw new Error("All fields required");
    }
    if (!validRole.includes(role)) {
        throw new Error("Invalid role");
    }
    const user = await usersRepository.addNewUser(
        name, email, password_hash, role
    )
    return user;
}

const patchUser = async (fields, updates, id) => {
    if (!fields.length || !id) {
        throw new Error("No updates provided");
    }
    
    const user = await usersRepository.updateUser(fields, updates, id);

    if (!user) {
        throw new Error("No user has this id!")
    }
    return user;
}

const deleteUser = async (id) => {
    const user = await usersRepository.deleteUser(id);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

export { 
    getUsers,
    getUserById,
    postUser,
    patchUser,
    deleteUser
};