import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const loginIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many login attempts, please try again later"
    }
});

export const loginEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many login attempts for this account, please try again later"
    },

    skipSuccessfulRequests: true,

    keyGenerator: (req) => {
        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : null;

        return email
            ? `login:${email}`
            : ipKeyGenerator(req.ip);
    }
});

export const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: { success: false, message: "Too many attempts, please try again later" }
});

export const resendVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: { success: false, message: "Too many attempts, please try again later" }
});


export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    message: {
        success: false,
        message: "Too many password reset requests, please try again later"
    }
})

export const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        success: false,
        message: "Too many password reset attempts. Please try again later."
    }
});

export const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        success: false,
        message: "Too many sign up attempts, please try again later"
    }
})
