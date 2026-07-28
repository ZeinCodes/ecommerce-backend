import express from "express"
import getAllUsers from "../controllers/users.controller.js"

const router = express.Router();

router.get('/users', getAllUsers);

export default router;