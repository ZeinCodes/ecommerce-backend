import express from "express"
import { createUserSchema, updateUserSchema } from "../validators/users.validator.js";
import validate from "../middlewares/validate.js";
import * as userController from "../controllers/users.controller.js"

const router = express.Router();

router.get('/users', userController.getAllUsers);

router.get('/users/:id', userController.getUserById);

router.post('/users', 
    validate(createUserSchema),
    userController.postUser,
);

router.patch('/users/:id', 
    validate(updateUserSchema),
    userController.patchUser
);

router.delete('/users/:id', userController.deleteUser)

export default router;