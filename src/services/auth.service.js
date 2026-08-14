import bcrypt from "bcrypt";
import * as authRepository from "../repositories/users.repository.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import { generateToken } from "../utils/jwt.js";

const login = async (email, password) => {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new UnauthorizedError("Invalid credentials");
    }

    const isPassed = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPassed) {
        throw new UnauthorizedError("Invalid credentials");
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

export {
    login
};