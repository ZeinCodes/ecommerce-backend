import * as userService from "../services/users.service.js";

const getAllUsers = async(req, res) => {
    try {
        const allUsers = await userService.getUsers();
        
        res.status(200).json({
            allUsers,
            success: true
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

const getUserById = async(req, res) => {
    const { id } = req.params;
    
    try {
        const user = await userService.getUserById(id);

        res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        res.status(404).json({
            message: "User not found",
            success: false
        })
    }
}

const postUser = async(req, res) => {
    const { name, email, passowrd_hash, role } = req.body;
    try {
        const user = await userService.postUser(name, email, passowrd_hash, role);

        res.status(201).json({
            message: "New User created",
            success: true,
            user
        })    
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }   
}

const patchUser = async (req, res) => {
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
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await userService.deleteUser(id);
    
        res.status(200).json({
            message: "User has been deleted",
            success: true
        })
    } catch (error) {
    if (error.message === "User not found") {
        return res.status(404).json({
            message: error.message,
            success: false
        });
    }

    res.status(500).json({
        message: "Internal server error",
        success: false
    });
}
}

export {
    getAllUsers,
    getUserById,
    postUser,
    patchUser,
    deleteUser 
};