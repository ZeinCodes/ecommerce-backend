import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import UnauthorizedError from "../errors/UnauthorizedError.js";

const getAccessSecret = () => {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not set");
    }

    return secret;
};

const getRefreshSecret = () => {
    const secret = process.env.JWT_REFRESH_SECRET;

    if (!secret) {
        throw new Error("JWT_REFRESH_SECRET is not set");
    }

    return secret;
};

const generateAccessToken = (user) => {
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role,
            type: "access"
        },
        getAccessSecret(),
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
            getAccessSecret()
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
        getRefreshSecret(),
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
            getRefreshSecret()
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
