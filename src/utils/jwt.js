import jwt from "jsonwebtoken";
import UnauthorizedError from "../errors/UnauthorizedError.js";

const generateToken = (user) => {
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return token;
};

const verifyToken = (token) => {
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
    generateToken,
    verifyToken
};