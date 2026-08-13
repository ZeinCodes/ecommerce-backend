import express from "express";
import validate from "../middlewares/validate.js";
import * as authController from "../controllers/auth.controller.js";
import { loginSchema } from "../validators/users.validator.js";

const authRouter = express.Router();

authRouter.post(
    "/auth/login",
    validate(loginSchema),
    authController.userLogin
);

export default authRouter;