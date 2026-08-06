import express from "express"
import { createUserSchema, updateUserSchema } from "../validators/users.validator.js";
import validate from "../middlewares/validate.js";
import * as userController from "../controllers/users.controller.js"

const usersRouter = express.Router();

usersRouter.get('/users', userController.getAllUsers);

usersRouter.get('/users/:id', userController.getUserById);

usersRouter.post('/users', 
    validate(createUserSchema),
    userController.postUser,
);

usersRouter.patch('/users/:id', 
    validate(updateUserSchema),
    userController.patchUser
);

usersRouter.delete('/users/:id', userController.deleteUser)

export default usersRouter;