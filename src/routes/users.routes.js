import express from "express"
import { createUserSchema, updateUserSchema } from "../validators/users.validator.js";
import validate from "../middlewares/validate.js";
import * as userController from "../controllers/users.controller.js"
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import authorizeOwner from "../middlewares/ownership.js";


const usersRouter = express.Router();

usersRouter.get('/users', 
    authenticate,  
    authorize("admin"),
    userController.getAllUsers
);

usersRouter.get('/users/:id',
    authenticate, 
    authorize("admin"),
    userController.getUserById
);

usersRouter.post('/users', 
    authenticate,
    authorize("admin"),
    validate(createUserSchema),
    userController.postUser,
);

usersRouter.patch('/users/:id',
    authenticate,
    authorizeOwner(),
    validate(updateUserSchema),
    userController.patchUser
);

usersRouter.delete('/users/:id',
    authenticate,
    authorizeOwner(),
    userController.deleteUser
);

export default usersRouter;