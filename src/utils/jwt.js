import jwt from "jsonwebtoken";
import UnauthorizedError from "../errors/UnauthorizedError.js";

const generateAccessToken = (user) => {
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    return token;
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (error) {
        throw new UnauthorizedError("Invalid or expired token");
    }
};

const generateRefreshToken = (user) => {
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d"
        }
    );

    return token;
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(
            token,
            process.env.JWT_SECRET
        );
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

