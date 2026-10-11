import { z } from "zod";
import ValidationError from "../errors/ValidationError.js";

const uuidSchema = z.uuid();

// Use with router.param(), e.g. router.param("id", validateUuidParam);
const validateUuidParam = (req, res, next, value, name) => {
    const result = uuidSchema.safeParse(value);

    if (!result.success) {
        return next(
            new ValidationError("Validation failed", {
                [name]: "Must be a valid UUID"
            })
        );
    }

    next();
};

export default validateUuidParam;
