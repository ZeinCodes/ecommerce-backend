import * as userService from "../services/users.service.js";

const getAllUsers = async (req, res, next) => {
    try {
        const allUsers = await userService.getUsers();

        res.status(200).json({
            success: true,
            allUsers
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

const postUser = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        const user = await userService.postUser(
            name,
            email,
            password,
            role
        );

        res.status(201).json({
            message: "New user created",
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

const patchUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await userService.patchUser(
            updates,
            id
        );

        res.status(200).json({
            message: "User updated",
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        await userService.deleteUser(id);

        res.status(200).json({
            message: "User has been deleted",
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export {
    getAllUsers,
    getUserById,
    postUser,
    patchUser,
    deleteUser
};