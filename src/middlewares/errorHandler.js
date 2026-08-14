import AppError from "../errors/AppError.js";

const errorHandler = (error, req, res, next) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    if (error.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "Conflict"
        });
    }

    if (error.code === "23503") {
        return res.status(400).json({
            success: false,
            message: "Bad request"
        });
    }

    if (error.code === "22P05") {
        return res.status(400).json({
            success: false,
            message: "Bad request"
        });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

export default errorHandler;