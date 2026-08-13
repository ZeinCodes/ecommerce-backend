import ForbiddenError from "../errors/ForbiddenError.js";

const authorizeOwner = () => {
    return (req, res, next) => {
        try {
            const user = req.user;

            if (user.role === "admin") {
                return next();
            }

            if (user.role === "user" && user.id === req.params.id) {
                return next();
            }

            throw new ForbiddenError(
                "You don't have access to this resource"
            );
        } catch (error) {
            next(error);
        }
    };
};

export default authorizeOwner;