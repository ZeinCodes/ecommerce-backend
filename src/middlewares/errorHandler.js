import multer from "multer";
import AppError from "../errors/AppError.js";

const errorHandler = (error, req, res, next) => {

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors
        });
    }

    if (error instanceof multer.MulterError) {
        const message =
            error.code === "LIMIT_FILE_SIZE"
                ? "File is too large (max 5MB per image)"
                : error.code === "LIMIT_UNEXPECTED_FILE"
                    ? "Too many files or unexpected field name (max 3 images, field name: images)"
                    : error.message;

        return res.status(400).json({
            success: false,
            message
        });
    }

    // PostgreSQL: unique violation
    if (error.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "Resource already exists"
        });
    }

    // PostgreSQL: foreign key violation
    if (error.code === "23503") {
        return res.status(400).json({
            success: false,
            message: "Referenced resource does not exist"
        });
    }

    // PostgreSQL: invalid input syntax
    if (error.code === "22P02") {
        return res.status(404).json({
            success: false,
            message: "Resource not found"
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};

export default errorHandler;