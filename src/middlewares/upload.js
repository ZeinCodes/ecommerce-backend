import multer from "multer";
import BadRequestError from "../errors/BadRequestError.js";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/webp"
        ) {
            cb(null, true);
            return;
        }
        cb(new BadRequestError("Only image files are allowed"));
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

export default upload;