import NotFoundError from "../errors/NotFoundError.js";
import * as usersRepository from "../repositories/users.repository.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const getUsers = async (page, limit) => {
    return await usersRepository.findAllUsers(page, limit);

};

const getUserById = async (id) => {
    const user = await usersRepository.findUserById(id);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
};

const postUser = async (
    name,
    email,
    password,
    role
) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await usersRepository.addNewUser(
        name,
        email,
        hashedPassword,
        role
    );

    return user;
};

const patchUser = async (updates, id) => {
    const processedUpdates = { ...updates };

    const passwordChanged = Object.prototype.hasOwnProperty.call(
        processedUpdates,
        "password"
    );

    const emailChanged = Object.prototype.hasOwnProperty.call(
        processedUpdates,
        "email"
    );

    if (passwordChanged) {
        processedUpdates.password = await bcrypt.hash(
            processedUpdates.password,
            10
        );
    }

    const user = await usersRepository.updateUser(
        processedUpdates,
        id
    );

    if (!user) {
        throw new NotFoundError("User not found");
    }

    if (passwordChanged) {
        await usersRepository.revokeUserRefreshTokens(id);
    }

    if (emailChanged) {
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

        await usersRepository.replaceUserVerificationToken(
            user.id,
            tokenHash,
            expiresAt
        );

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
            console.error("Failed to send email verification:", error)
        );
    }

    return user;
};

const deleteUser = async (id) => {
    const user = await usersRepository.deleteUser(id);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    await usersRepository.revokeUserRefreshTokens(id);

    return user;
};

export {
    getUsers,
    getUserById,
    postUser,
    patchUser,
    deleteUser
};