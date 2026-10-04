import bcrypt from "bcrypt";
import crypto from "node:crypto";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import ConflictError from "../errors/ConflictError.js";
import * as authRepository from "../repositories/users.repository.js";
import * as refreshTokenRepository from "../repositories/refresh_token.repositories.js"
import * as JWT from "../utils/jwt.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const DUMMY_PASSWORD_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

const login = async (email, password) => {
    const user = await authRepository.findUserByEmail(email);

    const isPassed = await bcrypt.compare(
        password,
        user ? user.password_hash : DUMMY_PASSWORD_HASH
    );

    if (!user || !isPassed) {
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

    if (
        storedToken.expires_at &&
        new Date(storedToken.expires_at) <= new Date()
    ) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    const user = await authRepository.findUserById(payload.id);

    if (!user) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    const accessToken = JWT.generateAccessToken({
        id: user.id,
        role: user.role
    });

    return accessToken;
};

const logout = async (token) => {
    JWT.verifyRefreshToken(token);

    const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const deleted =
        await refreshTokenRepository.deleteRefreshToken(tokenHash);

    if (!deleted) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    return deleted;
}

const forgotPassword = async (email) => {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        return;
    }

    const tokenExpireAt = new Date(
        Date.now() + 30 * 60 * 1000
    );

    const usedAt = null;

    const passwordResetToken = crypto
    .randomBytes(32)
    .toString("hex");

    const passwordResetTokenHash = crypto
    .createHash("sha256")
    .update(passwordResetToken)
    .digest("hex");

    await authRepository.invalidateUserResetTokens(user.id);

    const savedToken = await authRepository.forgotPassword(
        user.id,
        passwordResetTokenHash,
        tokenExpireAt,
        usedAt
    );

    resend.emails.send({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: "Reset your password",
        html: `
            <p>Click the link below to reset your password:</p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${passwordResetToken}">
                Reset your password
            </a>
            <p>This link expires in 30 minutes.</p>
        `
    }).catch((error) => {
        console.error("Failed to send password reset email:", error);
    });

    return savedToken;
}

const resetPassword = async (token, newPassword) => {
    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const result = await authRepository.resetPassword(
        tokenHash,
        newPasswordHash
    )

    return result;
};

export {
    login,
    register,
    refresh,
    logout,
    forgotPassword,
    resetPassword
};