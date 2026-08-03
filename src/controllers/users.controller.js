import * as userService from "../services/users.service.js";

const getAllUsers = async(req, res, next) => {
    try {
        const allUsers = await userService.getUsers();
        
        res.status(200).json({
            allUsers,
            success: true
        })

    } catch (error) {
        next(error)
    }
}

const getUserById = async(req, res, next) => {
    const { id } = req.params;
    
    try {
        const user = await userService.getUserById(id);

        res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        next(error)
    }
}

const postUser = async(req, res, next) => {
    const { name, email, password_hash, role } = req.body;
    try {
        const user = await userService.postUser(name, email, password_hash, role);

        res.status(201).json({
            message: "New User created",
            success: true,
            user
        })    
    } catch (error) {
        next(error);
    }   
}

const patchUser = async (req, res, next) => {
    const { id } = req.params;
    const updates  = req.body;
    const fields = Object.keys(updates);

    console.log(updates);
    console.log(fields);
 
    try {
        const user = await userService.patchUser(fields, updates, id);
        res.status(200).json({
            message: "User updated",
            success: true,
            user
        })
    } catch (error) {
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    const { id } = req.params;

    try {
        await userService.deleteUser(id);
    
        res.status(200).json({
            message: "User has been deleted",
            success: true
        })
    } catch (error) {
        next(error)
    }
}

export {
    getAllUsers,
    getUserById,
    postUser,
    patchUser,
    deleteUser 
};