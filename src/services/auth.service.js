import NotFoundError from "../errors/NotFoundError.js";
import bcrypt from 'bcrypt';
import * as authRepository from "../repositories/users.repository.js"
import UnauthorizedError from "../errors/UnauthorizedError.js";
import { generateToken } from "../utils/jwt.js";

const login = async (email, password) => {
    const user = await authRepository.findUserByEmail(email);

    console.log("service")
    
    if (!user) {
        throw new NotFoundError("There is no user with this email");
    }

    const isPassed = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPassed) {
        throw new UnauthorizedError("Wrong password");
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            name: user.name
        }
    }; 
}

export {
    login
} 