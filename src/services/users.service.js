import * as usersRepository from '../repositories/users.repository.js';

const getUsers = async() => {

    console.log("service reached");
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

export { 
    getUsers,
    getUserById
};