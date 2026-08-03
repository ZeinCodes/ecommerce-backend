import AppError from "./AppError.js";

class NotFoundError extends AppError {
    constructor(message = "User Not Found") {
        super(message, 404)
    }
}

export default NotFoundError;