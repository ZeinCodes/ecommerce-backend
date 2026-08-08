import UnauthorizedError from "../errors/UnauthorizedError.js";
import { verifyToken } from "../utils/jwt.js";

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedError("Authentication required");
        }
        
        const [scheme, token] = authHeader.split(" ")

        if (scheme !== "Bearer" || !token) {
            throw new UnauthorizedError("Invalide authorization header");
        }

        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        next(error);
    }
};

export default authenticate;