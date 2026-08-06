import * as authService from "../services/auth.service.js"

const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login(email, password);
        console.log("controller")
        res.status(200).json({
            success: true,
            message: `Welcom Back ${result.user.name}`,
            token: result.token
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
} 

export {
    userLogin
} 