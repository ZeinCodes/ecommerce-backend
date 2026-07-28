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

export {
    getAllUsers,
    getUserById
};