import bcrypt from "bcrypt";
import crypto from "node:crypto";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import ForbiddenError from "../errors/ForbiddenError.js";
import * as authRepository from "../repositories/users.repository.js";
import * as refreshTokenRepository from "../repositories/refresh_token.repositories.js"
import * as JWT from "../utils/jwt.js";
import {
    sendMail,
    verificationEmailHtml,
    passwordResetEmailHtml
} from "../utils/mailer.js";

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

    await sendMail({
        to: user.email,
        subject: "Verify your email",
        html: verificationEmailHtml(emailVerificationToken)
    });

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

    if (!user || user.email_verified_at) {
        return;
    }

    const token = crypto
        .randomBytes(32)
        .toString("hex");

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
    );

    await sendMail({
        to: user.email,
        subject: "Verify your email",
        html: verificationEmailHtml(token)
    });
};


const refresh = async (refreshToken) => {
    const payload = JWT.verifyRefreshToken(refreshToken);

    const user = await authRepository.findUserById(payload.id);

    if (!user) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

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

    const outcome = await refreshTokenRepository.rotateRefreshToken(
        tokenHash,
        user.id,
        newTokenHash,
        expiresAt
    );

    if (outcome === "missing") {
        // A validly signed token that is no longer stored was already used
        // (or revoked). Treat it as possible theft and end every session.
        await authRepository.revokeUserRefreshTokens(user.id);

        throw new UnauthorizedError("Invalid refresh token");
    }

    if (outcome === "expired") {
        throw new UnauthorizedError("Invalid refresh token");
    }

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

    const passwordResetToken = crypto
        .randomBytes(32)
        .toString("hex");

    const passwordResetTokenHash = crypto
        .createHash("sha256")
        .update(passwordResetToken)
        .digest("hex");

    await authRepository.invalidateUserResetTokens(user.id);

    const savedToken = await authRepository.createPasswordResetToken(
        user.id,
        passwordResetTokenHash,
        tokenExpireAt
    );

    // Failures are logged inside sendMail and never surfaced, so the response
    // is identical for existing and unknown emails.
    await sendMail({
        to: user.email,
        subject: "Reset your password",
        html: passwordResetEmailHtml(passwordResetToken)
    });

    return savedToken;
};

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