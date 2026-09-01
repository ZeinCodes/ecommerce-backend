import * as userService from "../services/users.service.js";

const getAllUsers = async (req, res, next) => {
    try {
        const {
            page,
            limit
        } = req.validated.query;

        const result = await userService.getUsers(
            page,
            limit
        );

        const totalPages = Math.ceil(
            result.total / limit
        );

        return res.status(200).json({
            success: true,
            result: result.users,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        return res.status(200).json({
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
        } = req.validated.body;

        const user = await userService.postUser(
            name,
            email,
            password,
            role
        );

        return res.status(201).json({
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
        const updates = req.validated.body;

        const user = await userService.patchUser(
            updates,
            id
        );

        return res.status(200).json({
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

        return res.status(200).json({
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