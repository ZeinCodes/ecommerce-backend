import express from 'express';
import validate from '../middlewares/validate.js';
import * as authController from '../controllers/auth.controller.js';
import { authuserLoginSchema } from '../validators/users.validator.js';

const authRouter = express.Router();

authRouter.post(
    '/auth/login',
    validate(authuserLoginSchema),
    authController.userLogin
);
 
export default authRouter;