import ForbiddenError from "../errors/ForbiddenError.js"

const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            
            if (!roles.includes(user.role)) {
                throw new ForbiddenError("This user has no access");    
            }
            
            next();
        } catch (error) {
            next(error);        
        }
    }
} 

export default authorize;