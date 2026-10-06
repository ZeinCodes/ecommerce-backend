import bcrypt from "bcrypt";
import crypto from "node:crypto";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import ForbiddenError from "../errors/ForbiddenError.js";
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

    if (!user.email_verified_at) {
        throw new ForbiddenError("Please verify your email first")
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
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailVerificationToken = crypto
        .randomBytes(32)
        .toString("hex");

    const emailVerificationTokenHash = crypto
        .createHash("sha256")
        .update(emailVerificationToken)
        .digest("hex");

    const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    let user;

    try {
        user = await authRepository.registerUserWithVerification(
            name,
            email,
            hashedPassword,
            emailVerificationTokenHash,
            expiresAt
        );
    } catch (error) {
        if (error.code === "23505") {
            return;
        }
        throw error;
    }

    try {
        await resend.emails.send({
            from: process.env.MAIL_FROM,
            to: user.email,
            subject: "Verify your email",
            html: `
                <p>Click the link below to verify your email:</p>

                <a href="${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}">
                    Verify your email
                </a>

                <p>This link expires in 24 hours.</p>
            `
        });
    } catch (error) {
        console.error(
            "Failed to send email verification:",
            error
        );
    }

    return {
        user: {
            name: user.name,
            email: user.email
        }
    };
};

const verifyEmail = async (token) => {
    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    await authRepository.verifyEmail(tokenHash);
}

const resendVerification = async (email) => {
    const user = await authRepository.findUserByEmail(email);

    if (!user || user.email_verified_at) return;

    const token = crypto.
        randomBytes(32).
        toString("hex");

    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    await authRepository.replaceUserVerificationToken(
        user.id,
        tokenHash,
        expiresAt
    )

    resend.emails.send({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: "Verify your email",
        html: `
            <p>Click the link below to verify your email:</p>
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verify your email</a>
            <p>This link expires in 24 hours.</p>
        `
    }).catch((error) =>
        console.error("Failed to send email verification:", error
        ));
};

const refresh = async (refreshToken) => {
    const payload = JWT.verifyRefreshToken(refreshToken);

    const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const storedToken =
        await refreshTokenRepository.deleteRefreshToken(tokenHash);

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

    const newRefreshToken = JWT.generateRefreshToken({
        id: user.id,
        role: user.role
    });

    const newTokenHash = crypto
        .createHash("sha256")
        .update(newRefreshToken)
        .digest("hex");

    const expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    await refreshTokenRepository.createRefreshToken(
        user.id,
        newTokenHash,
        expiresAt
    );

    return {
        accessToken,
        refreshToken: newRefreshToken
    };
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
    resetPassword,
    verifyEmail,
    resendVerification
};