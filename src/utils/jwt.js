import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import UnauthorizedError from "../errors/UnauthorizedError.js";

const generateAccessToken = (user) => {
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role,
            type: "access"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
            jwtid: crypto.randomUUID()
        }
    );

    return token;
};

const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.type !== "access") {
            throw new Error("Wrong token type");
        }

        return decoded;
    } catch (error) {
        throw new UnauthorizedError("Invalid or expired token");
    }
};

const generateRefreshToken = (user) => {
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role,
            type: "refresh"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
            jwtid: crypto.randomUUID()
        }
    );

    return token;
};

const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.type !== "refresh") {
            throw new Error("Wrong token type");
        }

        return decoded;
    } catch (error) {
        throw new UnauthorizedError("Invalid or expired token");
    }
};

export {
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken
};