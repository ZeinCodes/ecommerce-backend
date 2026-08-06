import jwt from "jsonwebtoken";

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

export {
    generateToken
}