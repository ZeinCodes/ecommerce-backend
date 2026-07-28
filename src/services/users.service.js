import findAll from '../repositories/users.repository.js';

const getFullUsers = async(email, role) => {
    try {
        const user = await findAll(email, role);
        return user;
    } catch (error) {
        console.log(error);
    }
}

export default getFullUsers;