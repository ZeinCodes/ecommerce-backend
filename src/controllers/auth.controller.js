import * as authService from "../services/auth.service.js";

const userLogin = async (req, res, next) => {
    try {        
        const { email, password } = req.validated.body;

        const result = await authService.login(
            email,
            password
        );

        res.status(200).json({
            success: true,
            message: `Welcome Back ${result.user.name}`,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    } catch (error) {
        next(error);
    }
};

const userRegister = async (req, res, next) => {
    try {
        
        const { name, email, password } = req.validated.body;
        
        const result = await authService.register(
            name, email, password
        );
        
        res.status(201).json({
            success: true,
            message: "Signed up",
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        })
    } catch (error) {
        next(error);        
    }
}

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.validated.body;

        const accessToken = await authService.refresh(refreshToken);

        res.status(200).json({
            success: true,
            accessToken
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.validated.body;

        await authService.logout(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Successfully logged out"
        });
    } catch (error) {
        next(error);
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.validated.body;

        await authService.forgotPassword(email);

        return res.status(200).json({
            success: true,
            message: "If that email exists, a reset link has been sent"
        })
    } catch (error) {
        next(error);
    }
}

const resetPassword = async (req, res, next) => {
    try { 
        const { token, newPassword } = req.validated.body;

        await authService.resetPassword(
            token, 
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password successfully changed"
        })
    } catch (error) {
        next(error);
    }
}

export {
    userLogin,
    userRegister,
    refresh,
    logout,
    forgotPassword,
    resetPassword
};