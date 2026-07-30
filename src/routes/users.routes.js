import express from "express"
import * as userController from "../controllers/users.controller.js"

const router = express.Router();

router.get('/users', userController.getAllUsers);

router.get('/users/:id', userController.getUserById);

router.post('/users', userController.postUser,);

router.patch('/users/:id', userController.patchUser);

router.delete('/users/:id', userController.deleteUser)

export default router;