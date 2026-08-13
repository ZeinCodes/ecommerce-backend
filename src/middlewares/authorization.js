import ForbiddenError from "../errors/ForbiddenError.js";

const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new ForbiddenError("User information is missing");
            }

            if (!roles.includes(req.user.role)) {
                throw new ForbiddenError("This user has no access");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default authorize;