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
            expiresIn: "1h"
        }
    );
    return token;
}

const verifyToken = (token) => {
    try {
        const result = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        return result;
    } catch (error) {
        throw new UnauthorizedError();
    }
}

export {
    generateToken,
    verifyToken
}