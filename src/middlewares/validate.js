import ValidationError from "../errors/ValidationError.js";

const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                const errors = {};

                result.error.issues.forEach((issue) => {
                    const field = issue.path[0];

                    if (field) {
                        errors[field] = issue.message;
                    } else {
                        errors.general = issue.message;
                    }
                });

                throw new ValidationError(JSON.stringify(errors));
            }

            req.body = result.data;

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default validate;