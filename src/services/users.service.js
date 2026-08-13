import NotFoundError from "../errors/NotFoundError.js";
import * as usersRepository from "../repositories/users.repository.js";
import bcrypt from "bcrypt";

const getUsers = async () => {
    const users = await usersRepository.findAllUsers();

    return users;
};

const getUserById = async (id) => {
    const user = await usersRepository.findUserById(id);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
};

const postUser = async (
    name,
    email,
    password,
    role
) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await usersRepository.addNewUser(
        name,
        email,
        hashedPassword,
        role
    );

    return user;
};

const patchUser = async (updates, id) => {
    const processedUpdates = { ...updates };

    if (processedUpdates.password) {
        processedUpdates.password = await bcrypt.hash(
            processedUpdates.password,
            10
        );
    }

    const user = await usersRepository.updateUser(
        processedUpdates,
        id
    );

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
};

const deleteUser = async (id) => {
    const user = await usersRepository.deleteUser(id);

    if (!user) {
        throw new NotFoundError("User not found");
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