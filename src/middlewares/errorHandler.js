
import multer from "multer";
import AppError from "../errors/AppError.js";

const errorHandler = (error, req, res, next) => {
    // Delegate errors if the response has already started.
    if (res.headersSent) {
        return next(error);
    }

    // Handle known application errors.
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors
        });
    }

    // Handle Multer upload errors.
    if (error instanceof multer.MulterError) {
        const message =
            error.code === "LIMIT_FILE_SIZE"
                ? "File is too large (max 1.5MB per image)"
                : error.code === "LIMIT_UNEXPECTED_FILE"
                    ? "Too many files or unexpected field name (max 3 images, field name: images)"
                    : error.message;

        return res.status(400).json({
            success: false,
            message
        });
    }

    // Handle malformed JSON bodies.
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON body"
        });
    }

    // Handle oversized request bodies.
    if (error.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message: "Request body is too large"
        });
    }

    // PostgreSQL: unique constraint violation.
    if (error.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "Resource already exists"
        });
    }

    // PostgreSQL: foreign key violation.
    if (error.code === "23503") {
        return res.status(400).json({
            success: false,
            message: "Referenced resource does not exist"
        });
    }

    // PostgreSQL: invalid input syntax, such as a malformed UUID.
    if (error.code === "22P02") {
        return res.status(404).json({
            success: false,
            message: "Resource not found"
        });
    }

    // Log unexpected errors privately for debugging.
    console.error(
        `[${new Date().toISOString()}] Unhandled error on ${req.method} ${req.originalUrl}:`,
        error
    );

    // Never expose internal error details or stack traces to clients.
    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

export default errorHandler;
