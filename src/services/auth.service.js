import bcrypt from "bcrypt";
import crypto from "node:crypto";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import ConflictError from "../errors/ConflictError.js";
import * as authRepository from "../repositories/users.repository.js";
import * as refreshTokenRepository from "../repositories/refresh_token.repositories.js"
import * as JWT from "../utils/jwt.js";

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
    
    const accessToken = JWT.generateAccessToken(user);
    const refreshToken = JWT.generateRefreshToken(user);
  
    const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex")
                          
    const expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
    );
    
    await refreshTokenRepository.createRefreshToken(
        user.id,
        tokenHash,
        expiresAt
    )

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

const register = async (name, email, password) => {
    const existingUser = await authRepository.findUserByEmail(email);
    
    if (existingUser) {
        throw new ConflictError("Email is already registered");    
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const user = await authRepository.registerUser(
        name,
        email,
        hashedPassword
    );

    const accessToken = JWT.generateAccessToken(user);
    const refreshToken = JWT.generateRefreshToken(user);

    const expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex") 

    await refreshTokenRepository.createRefreshToken(
        user.id,
        tokenHash,
        expiresAt
    )

    return {
        accessToken,
        refreshToken,
        user: {
            name: user.name,
            email: user.email,
        }
    };
}

const refresh = async (refreshToken) => {
    const payload = JWT.verifyRefreshToken(refreshToken);

    const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const storedToken =
        await refreshTokenRepository.findRefreshTokenByHash(tokenHash);

    if (!storedToken) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    const accessToken = JWT.generateAccessToken({
        id: payload.id,
        role: payload.role
    });

    return accessToken;
};``

export {
    login,
    register,
    refresh
};
