import multer from "multer";
import crypto from "node:crypto"
import path from "node:path"

const storage = multer.diskStorage({
    destination: "uploads/",
    
    filename: (req, file, cb) => {
        const extention = path.extname(file.originalname);

        const uniqueName = `${crypto.randomUUID()}${extention}`;
                
        cb(null, uniqueName);
    }
})

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
        cb(new Error("Only image files are allowed"))
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

export default upload;