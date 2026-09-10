import bcrypt from "bcrypt";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import * as authRepository from "../repositories/users.repository.js";
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

const register = async (name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = authRepository.findUserByEmail(email);

    if (existingUser) {
        throw new ConflictError("Email is already registered");    
    }

    const user = await authRepository.registerUser(
        name,
        email,
        hashedPassword
    );

    const token = generateToken(user);

    return {
        token,
        user: {
            name: user.name,
            email: user.email,
        }
    };
}

export {
    login,
    register
};
