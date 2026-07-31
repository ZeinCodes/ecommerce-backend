const validate = (schema) => {
    return(req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
        const errors = {};  

        result.error.issues.forEach((issue) => {
            errors[issue.path[0]] = issue.message;
        });

        return res.status(400).json({
            success: false,
            errors
        });
    }

        req.body = result.data;

        next();
    }
}

export default validate;