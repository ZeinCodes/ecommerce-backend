import ValidationError from "../errors/ValidationError.js";

const validate = (schema, source = "body") => {

    return (req, res, next) => {

        try {

            const result = schema.safeParse(req[source]);

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

                throw new ValidationError(
                    "Validation failed",
                    errors,
                    console.log(errors)
                );
            }

            req.validated = req.validated || {};

            req.validated[source] = result.data;

            next();

        } catch (error) {

            next(error);

        }
    };
};

export default validate;