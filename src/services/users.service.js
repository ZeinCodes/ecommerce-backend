import NotFoundError from '../errors/NotFoundError.js';
import * as usersRepository from '../repositories/users.repository.js';

const getUsers = async() => {
    const users = await usersRepository.findAllUsers();
    return users;
}

const getUserById = async(id) => {
    const user = await usersRepository.findUserById(id);
    if (!user) {
        throw new NotFoundError();
    }
    return user;
}

const postUser = async(
    name, email,
    password_hash, role
) => {       
    const user = await usersRepository.addNewUser(
        name, email, password_hash, role
    )
    return user;
}

const patchUser = async (fields, updates, id) => {
    const user = await usersRepository.updateUser(fields, updates, id);

    if (!user) {
        throw new NotFoundError();
    }
    return user;
}

const deleteUser = async (id) => {
    const user = await usersRepository.deleteUser(id);

    if (!user) {
        throw new NotFoundError();
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